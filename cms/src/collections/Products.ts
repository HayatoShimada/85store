import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { loggedIn } from '../access'
import { productBeforeChange, productAfterChange } from '../shopify/product-hooks'
import { productRefreshEndpoint } from '../shopify/import'
import { describeEndpoint } from '../crm/endpoints'

// 商品。正は Shopify で、Payload は入力画面（src/shopify/sync.ts）。
// 画面を開いたときと10分ごとに Shopify から取り込み、保存すると Shopify に送る。
// 在庫数の増減は 85crm と Shopify（注文）の担当なので、ここでは表示だけ。原価・SKU・初期在庫は作成時だけ使う。
const MEASUREMENT_NAMES = '着丈・身幅・肩幅・袖丈（トップス）、ウエスト・股上・股下・もも周り・裾周り（パンツ）'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: '商品', plural: '商品' },
  access: { read: loggedIn, create: loggedIn, update: loggedIn, delete: () => false },
  admin: {
    useAsTitle: 'title',
    group: '商品',
    defaultColumns: ['title', 'kind', 'status', 'shopify.syncStatus', 'updatedAt'],
    listSearchableFields: ['title', 'shopify.handle'],
    description: 'Shopify の商品の入力画面です。開いたときに Shopify の最新の内容を取り込み、保存すると Shopify に反映します。商品を消すときは「状態」をアーカイブにしてください。',
  },
  endpoints: [productRefreshEndpoint, describeEndpoint],
  hooks: {
    beforeChange: [productBeforeChange],
    afterChange: [productAfterChange],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: '基本',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'kind',
                  label: '区分',
                  type: 'select',
                  required: true,
                  defaultValue: 'used',
                  options: [
                    { label: '古着', value: 'used' },
                    { label: '新品', value: 'new' },
                    { label: '委託', value: 'consignment' },
                  ],
                },
                {
                  name: 'status',
                  label: '状態',
                  type: 'select',
                  required: true,
                  defaultValue: 'draft',
                  options: [
                    { label: '下書き', value: 'draft' },
                    { label: '公開（販売中）', value: 'active' },
                    { label: 'アーカイブ', value: 'archived' },
                  ],
                },
                { name: 'newArrival', label: '新着', type: 'checkbox' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'brand', label: 'ブランド', type: 'relationship', relationTo: 'brands' },
                { name: 'name', label: '品名', type: 'text', admin: { description: '例: Italian Velor 3B Jacket' } },
              ],
            },
            {
              name: 'autoTitle',
              label: '商品名をブランドと品名から作る（[BRAND] 品名 [USED]）',
              type: 'checkbox',
              defaultValue: true,
            },
            { name: 'titleSuffix', label: '商品名の末尾（新品の色など）', type: 'text', admin: { condition: (d) => d?.autoTitle && d?.kind !== 'used' } },
            {
              name: 'title',
              label: '商品名',
              type: 'text',
              required: true,
              admin: { description: 'Shopify の自動コレクションが商品名で判定しているので、[BRAND] と [USED] の形を崩さないでください。' },
            },
            {
              name: 'images',
              label: '写真',
              type: 'array',
              labels: { singular: '写真', plural: '写真' },
              admin: { description: '1枚目が商品の代表画像になります。ドラッグで並べ替えできます。' },
              fields: [
                { name: 'preview', type: 'ui', admin: { components: { Field: '/components/ShopifyImagePreview#ShopifyImagePreview' } } },
                { name: 'photo', label: '写真', type: 'upload', relationTo: 'productPhotos', admin: { condition: (_d, s) => !s?.shopifyMediaId } },
                { name: 'shopifyUrl', type: 'text', admin: { hidden: true } },
                { name: 'alt', label: '代替テキスト', type: 'text' },
                { name: 'shopifyMediaId', type: 'text', admin: { hidden: true } },
              ],
            },
            { name: 'describe', type: 'ui', admin: { components: { Field: '/components/DescribeButton#DescribeButton' } } },
            {
              name: 'description',
              label: '説明文',
              type: 'richText',
              editor: lexicalEditor(),
              admin: { description: '編集すると、下の HTML が作り直されて Shopify に送られます。説明文の中に埋め込まれた画像は、編集すると消えます（商品の写真は「写真」に入れてください）。' },
            },
            {
              name: 'descriptionHtml',
              label: '説明文（Shopify に送る HTML）',
              type: 'textarea',
              admin: { readOnly: true, rows: 4 },
            },
            { name: 'seoDescription', label: '検索結果の説明', type: 'textarea' },
          ],
        },
        {
          label: '価格とバリエーション',
          fields: [
            {
              name: 'options',
              label: 'オプション（サイズ・色など）',
              type: 'array',
              admin: { description: '1点ものは空のままにします。' },
              fields: [
                { name: 'name', label: '名前', type: 'text', required: true },
                { name: 'values', label: '値', type: 'text', hasMany: true },
              ],
            },
            {
              name: 'variants',
              label: '価格・在庫',
              type: 'array',
              minRows: 1,
              defaultValue: [{}],
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'optionValues', label: 'オプションの値', type: 'text', hasMany: true, admin: { condition: (data) => Boolean(data?.options?.length) } },
                    { name: 'price', label: '価格（円）', type: 'number', required: true, min: 0 },
                    { name: 'compareAtPrice', label: '定価（円）', type: 'number', min: 0 },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'sku', label: 'SKU', type: 'text', admin: { readOnly: false, description: '作成時だけ送ります' } },
                    { name: 'cost', label: '原価（円）', type: 'number', min: 0, admin: { description: '作成時だけ送ります' } },
                    { name: 'initialQuantity', label: '初期在庫', type: 'number', min: 0, defaultValue: 1, admin: { description: '作成時だけ送ります' } },
                    { name: 'inventoryQuantity', label: '今の在庫', type: 'number', admin: { readOnly: true } },
                  ],
                },
                { name: 'shopifyVariantId', type: 'text', admin: { hidden: true } },
                { name: 'inventoryItemId', type: 'text', admin: { hidden: true } },
              ],
            },
          ],
        },
        {
          label: '古着の情報',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'condition',
                  label: '状態ランク',
                  type: 'select',
                  options: ['SS', 'S', 'A', 'B', 'C'].map((v) => ({ label: v, value: v })),
                },
                { name: 'era', label: '年代', type: 'text', admin: { description: '例: 80s、ヴィンテージ' } },
              ],
            },
            {
              name: 'conditionNote',
              label: '状態メモ',
              type: 'textarea',
              admin: { description: '傷・汚れ・ほつれなど、この商品だけの状態。実物を確認して書く。商品ページの「この商品の状態」に出ます（説明文には書かない）' },
            },
            {
              name: 'measurements',
              label: '採寸（cm）',
              type: 'array',
              admin: { description: `採寸する順に並べます。${MEASUREMENT_NAMES}` },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', label: '箇所', type: 'text', required: true },
                    { name: 'value', label: 'cm', type: 'number', required: true },
                  ],
                },
              ],
            },
            { name: 'style', label: 'スタイル', type: 'text', hasMany: true },
            { name: 'features', label: '特徴', type: 'text', hasMany: true },
          ],
        },
        {
          label: '分類・仕入れ',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'productType', label: '品目（productType）', type: 'text', admin: { description: '例: Shirts、Coats & Jackets' } },
                { name: 'vendor', label: 'vendor', type: 'text', defaultValue: '85-store' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'categoryId', label: 'Shopify のカテゴリ ID', type: 'text' },
                { name: 'categoryName', label: 'カテゴリ', type: 'text', admin: { readOnly: true } },
              ],
            },
            { name: 'tags', label: 'タグ', type: 'text', hasMany: true, admin: { description: '区分（USED / NOT USED / 委託）と「新着」は上の項目に合わせて自動で付け外しします。' } },
            {
              type: 'row',
              fields: [
                { name: 'supplier', label: '仕入先', type: 'text' },
                { name: 'deliveryNumber', label: '納品番号', type: 'text' },
                { name: 'deliveryDate', label: '納品日', type: 'text' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'shopify',
      label: 'Shopify',
      type: 'group',
      admin: { position: 'sidebar' },
      fields: [
        { name: 'refresher', type: 'ui', admin: { components: { Field: '/components/ShopifyRefresher#ShopifyRefresher' } } },
        {
          name: 'syncStatus',
          label: '同期',
          type: 'select',
          options: [
            { label: '同期済み', value: 'synced' },
            { label: '待ち', value: 'pending' },
            { label: '確認のみ（dry-run）', value: 'dry-run' },
            { label: 'Shopify 側で変更あり', value: 'conflict' },
            { label: 'エラー', value: 'error' },
          ],
          admin: { readOnly: true },
        },
        { name: 'syncMessage', label: '内容', type: 'textarea', admin: { readOnly: true } },
        {
          name: 'resolve',
          label: 'Shopify 側で変更があったとき',
          type: 'select',
          options: [
            { label: 'Payload の内容で上書きする', value: 'overwrite' },
            { label: 'Shopify の内容を取り込む', value: 'import' },
          ],
          admin: { condition: (data) => data?.shopify?.syncStatus === 'conflict', description: '選んで保存すると実行します。' },
        },
        { name: 'productId', label: '商品 ID', type: 'text', index: true, admin: { readOnly: true } },
        { name: 'handle', label: 'handle', type: 'text', admin: { readOnly: true } },
        { name: 'updatedAt', label: 'Shopify の更新日時', type: 'text', admin: { readOnly: true } },
        { name: 'lastSyncedAt', label: '前回の同期', type: 'date', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
        // 前回同期した時点の内容の指紋（Payload 以外での変更の検知に使う）
        { name: 'fingerprint', type: 'text', admin: { hidden: true } },
        // 取り込んだ（または前回送った）メタフィールド。入力欄で変えたものだけを置き換えて送る
        { name: 'metafields', type: 'json', admin: { hidden: true } },
      ],
    },
  ],
}
