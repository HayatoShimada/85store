import type { CollectionConfig } from 'payload'
import { adminOnly, loggedIn } from '../../access'
import { handleField, storeHooks, storeRefreshEndpoint, syncSidebar } from '../../shopify/store'
import { bodyFields } from '../../shopify/store/html'
import { imageFields, seoFields, templateField } from './shared'

// ストアのブログの記事（shop.85-store.com/blogs/<ブログ>/<handle>）。85-store.com の記事（「記事」）とは別
export const StoreArticles: CollectionConfig = {
  slug: 'storeArticles',
  labels: { singular: 'ストアの記事', plural: 'ストアの記事' },
  access: { read: loggedIn, create: loggedIn, update: loggedIn, delete: adminOnly },
  admin: {
    group: 'ストア（shop.85-store.com）',
    useAsTitle: 'title',
    defaultColumns: ['title', 'blog', 'isPublished', 'shopify.syncStatus'],
    description: 'Shopify のストアのブログの記事です（85-store.com の記事は「サイト」の「記事」）。保存すると Shopify に反映します。',
  },
  endpoints: [storeRefreshEndpoint('storeArticles')],
  hooks: storeHooks('storeArticles', ['body']),
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: '本文',
          fields: [
            { name: 'title', label: 'タイトル', type: 'text', required: true },
            ...bodyFields('body', '本文'),
            { name: 'summary', label: '抜粋（HTML）', type: 'textarea', admin: { description: '一覧に出る短い紹介文です。例: <p>…</p>' } },
          ],
        },
        { label: 'アイキャッチ', fields: imageFields() },
        { label: '検索結果', fields: [handleField(), ...seoFields()] },
      ],
    },
    { name: 'blog', label: 'ブログ', type: 'relationship', relationTo: 'storeBlogs', required: true, admin: { position: 'sidebar' } },
    { name: 'isPublished', label: '公開する', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'author', label: '書いた人', type: 'text', defaultValue: '85-Store', admin: { position: 'sidebar' } },
    { name: 'tags', label: 'タグ', type: 'text', hasMany: true, admin: { position: 'sidebar' } },
    templateField(),
    syncSidebar(),
  ],
}
