import type { CollectionConfig, Field } from 'payload'
import { adminOnly, loggedIn } from '../../access'
import { storeHooks, storeRefreshEndpoint, syncSidebar } from '../../shopify/store'
import { RESOURCE_TYPES } from '../../shopify/store/menus'

// ストアのメニュー（main-menu・footer など）
const TYPES = [
  { label: 'コレクション', value: 'COLLECTION' },
  { label: '商品', value: 'PRODUCT' },
  { label: 'ページ', value: 'PAGE' },
  { label: 'ブログ', value: 'BLOG' },
  { label: 'ストアの記事', value: 'ARTICLE' },
  { label: 'URL', value: 'HTTP' },
  { label: 'トップページ', value: 'FRONTPAGE' },
  { label: 'すべての商品', value: 'CATALOG' },
  { label: 'すべてのコレクション', value: 'COLLECTIONS' },
  { label: '検索', value: 'SEARCH' },
  { label: 'ポリシー', value: 'SHOP_POLICY' },
  { label: 'メタオブジェクト', value: 'METAOBJECT' },
  { label: 'お客さまのアカウント', value: 'CUSTOMER_ACCOUNT_PAGE' },
]
const RAW_ID_TYPES = ['SHOP_POLICY', 'METAOBJECT', 'CUSTOMER_ACCOUNT_PAGE']

// 項目（3階層まで）
function itemFields(depth: number): Field[] {
  return [
    {
      type: 'row',
      fields: [
        { name: 'title', label: '表示名', type: 'text', required: true },
        { name: 'type', label: 'リンク先の種類', type: 'select', required: true, defaultValue: 'HTTP', options: TYPES },
      ],
    },
    {
      name: 'resource',
      label: 'リンク先',
      type: 'relationship',
      relationTo: Object.values(RESOURCE_TYPES),
      admin: { condition: (_d, s) => Boolean(RESOURCE_TYPES[s?.type]) },
    },
    { name: 'url', label: 'URL', type: 'text', admin: { condition: (_d, s) => s?.type === 'HTTP' } },
    { name: 'tags', label: '絞り込みのタグ', type: 'text', hasMany: true, admin: { condition: (_d, s) => s?.type === 'COLLECTION' } },
    // ポリシーなど Payload に無いリンク先の Shopify の ID（取り込んだものをそのまま使う）
    { name: 'resourceId', label: 'リンク先の Shopify の ID', type: 'text', admin: { readOnly: true, condition: (_d, s) => RAW_ID_TYPES.includes(s?.type) } },
    { name: 'itemId', type: 'text', admin: { hidden: true } },
    ...(depth < 3
      ? [
          {
            name: 'items',
            label: depth === 1 ? '下の項目' : 'さらに下の項目',
            type: 'array',
            labels: { singular: '項目', plural: '項目' },
            admin: { initCollapsed: true },
            fields: itemFields(depth + 1),
          } as Field,
        ]
      : []),
  ]
}

export const StoreMenus: CollectionConfig = {
  slug: 'storeMenus',
  labels: { singular: 'メニュー', plural: 'メニュー' },
  access: { read: loggedIn, create: adminOnly, update: loggedIn, delete: adminOnly },
  admin: {
    group: 'ストア（shop.85-store.com）',
    useAsTitle: 'title',
    defaultColumns: ['title', 'handle', 'shopify.syncStatus'],
    description: 'Shopify のストアのメニューです。保存すると Shopify に反映します。',
  },
  endpoints: [storeRefreshEndpoint('storeMenus')],
  hooks: storeHooks('storeMenus'),
  fields: [
    { name: 'title', label: 'タイトル', type: 'text', required: true },
    {
      name: 'handle',
      label: 'handle',
      type: 'text',
      admin: { description: 'テーマがメニューを探すときの名前です（main-menu・footer など）。' },
      access: { update: ({ doc }) => !doc?.isDefault },
    },
    { name: 'isDefault', type: 'checkbox', admin: { hidden: true } },
    {
      name: 'items',
      label: '項目',
      type: 'array',
      labels: { singular: '項目', plural: '項目' },
      admin: { initCollapsed: true },
      fields: itemFields(1),
    },
    syncSidebar(),
  ],
}
