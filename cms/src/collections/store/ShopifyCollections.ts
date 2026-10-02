import type { CollectionConfig } from 'payload'
import { adminOnly, loggedIn } from '../../access'
import { handleField, storeHooks, storeRefreshEndpoint, syncSidebar } from '../../shopify/store'
import { bodyFields } from '../../shopify/store/html'
import { imageFields, seoFields, templateField } from './shared'

// Shopify のコレクション。自動（条件で商品が決まる）と手動（商品を選ぶ）は、作ったあとで変えられない
const COLUMNS = [
  { label: '商品名', value: 'TITLE' },
  { label: 'タグ', value: 'TAG' },
  { label: '品目（productType）', value: 'TYPE' },
  { label: 'vendor', value: 'VENDOR' },
  { label: 'カテゴリ', value: 'PRODUCT_CATEGORY_ID' },
  { label: 'カテゴリ（下の階層も含む）', value: 'PRODUCT_CATEGORY_ID_WITH_DESCENDANTS' },
  { label: 'メタフィールド（サイズなど）', value: 'PRODUCT_METAFIELD_DEFINITION' },
  { label: '価格', value: 'VARIANT_PRICE' },
  { label: '定価', value: 'VARIANT_COMPARE_AT_PRICE' },
  { label: '値下げ中', value: 'IS_PRICE_REDUCED' },
  { label: '在庫数', value: 'VARIANT_INVENTORY' },
  { label: '重さ', value: 'VARIANT_WEIGHT' },
  { label: 'バリエーション名', value: 'VARIANT_TITLE' },
  { label: 'バリエーションのメタフィールド', value: 'VARIANT_METAFIELD_DEFINITION' },
  { label: 'カテゴリ（旧）', value: 'PRODUCT_TAXONOMY_NODE_ID' },
]
const RELATIONS = [
  { label: 'を含む', value: 'CONTAINS' },
  { label: 'を含まない', value: 'NOT_CONTAINS' },
  { label: 'と等しい', value: 'EQUALS' },
  { label: 'と等しくない', value: 'NOT_EQUALS' },
  { label: 'で始まる', value: 'STARTS_WITH' },
  { label: 'で終わる', value: 'ENDS_WITH' },
  { label: 'より大きい', value: 'GREATER_THAN' },
  { label: 'より小さい', value: 'LESS_THAN' },
  { label: '設定されている', value: 'IS_SET' },
  { label: '設定されていない', value: 'IS_NOT_SET' },
]
const SORT_ORDERS = [
  { label: '売れている順', value: 'BEST_SELLING' },
  { label: '新しい順', value: 'CREATED_DESC' },
  { label: '古い順', value: 'CREATED' },
  { label: '価格の高い順', value: 'PRICE_DESC' },
  { label: '価格の安い順', value: 'PRICE_ASC' },
  { label: '名前順（A→Z）', value: 'ALPHA_ASC' },
  { label: '名前順（Z→A）', value: 'ALPHA_DESC' },
  { label: '手動（下の並び順）', value: 'MANUAL' },
]
const isMetafield = (column: unknown) => column === 'PRODUCT_METAFIELD_DEFINITION' || column === 'VARIANT_METAFIELD_DEFINITION'

export const ShopifyCollections: CollectionConfig = {
  slug: 'shopifyCollections',
  labels: { singular: 'コレクション', plural: 'コレクション' },
  access: { read: loggedIn, create: loggedIn, update: loggedIn, delete: adminOnly },
  admin: {
    group: '商品',
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'handle', 'shopify.syncStatus'],
    listSearchableFields: ['title', 'handle'],
    description: 'Shopify のコレクションの入力画面です。開いたときに Shopify の最新の内容を取り込み、保存すると Shopify に反映します。',
  },
  endpoints: [storeRefreshEndpoint('shopifyCollections')],
  hooks: storeHooks('shopifyCollections', ['descriptionHtml']),
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: '基本',
          fields: [
            {
              name: 'kind',
              label: '種類',
              type: 'radio',
              required: true,
              defaultValue: 'smart',
              options: [
                { label: '自動（条件に合う商品が入る）', value: 'smart' },
                { label: '手動（商品を選ぶ）', value: 'manual' },
              ],
              admin: { layout: 'horizontal', description: '作ったあとは変えられません。' },
              access: { update: ({ doc }) => !doc?.shopify?.id },
            },
            { name: 'title', label: 'タイトル', type: 'text', required: true },
            handleField(),
            ...bodyFields('descriptionHtml', '説明'),
            ...imageFields(),
            { name: 'sortOrder', label: '商品の並び順', type: 'select', required: true, defaultValue: 'BEST_SELLING', options: SORT_ORDERS },
          ],
        },
        {
          label: '商品',
          fields: [
            {
              name: 'appliedDisjunctively',
              label: 'どれかの条件に合えば入れる（オフ: すべての条件に合う商品だけ）',
              type: 'checkbox',
              defaultValue: false,
              admin: { condition: (data) => data?.kind === 'smart' },
            },
            {
              name: 'rules',
              label: '条件',
              type: 'array',
              labels: { singular: '条件', plural: '条件' },
              admin: {
                condition: (data) => data?.kind === 'smart',
                description: '商品名で判定する条件（[BRAND] や USED）は、商品名の付け方と合わせてください。サイズ・カテゴリの条件は、値が Shopify の ID になります（右の名前で確認できます）。',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'column', label: '項目', type: 'select', required: true, defaultValue: 'TITLE', options: COLUMNS },
                    { name: 'relation', label: '比べ方', type: 'select', required: true, defaultValue: 'CONTAINS', options: RELATIONS },
                    { name: 'condition', label: '値', type: 'text', required: true },
                    { name: 'conditionLabel', label: '値の名前', type: 'text', admin: { readOnly: true, condition: (_d, s) => Boolean(s?.conditionLabel) } },
                  ],
                },
                {
                  name: 'conditionObjectId',
                  label: 'メタフィールドの定義 ID',
                  type: 'text',
                  admin: { condition: (_d, s) => isMetafield(s?.column), description: '既存のサイズの条件の行からコピーしてください。' },
                },
              ],
            },
            {
              name: 'products',
              label: '商品',
              type: 'relationship',
              relationTo: 'products',
              hasMany: true,
              admin: {
                condition: (data) => data?.kind === 'manual',
                description: '並び順が「手動」のときは、この順番で並びます。',
              },
            },
          ],
        },
        { label: '検索結果', fields: seoFields() },
      ],
    },
    templateField(),
    syncSidebar(),
  ],
}
