import type { CollectionConfig } from 'payload'
import { adminOnly, loggedIn } from '../../access'
import { handleField, storeHooks, storeRefreshEndpoint, syncSidebar } from '../../shopify/store'
import { bodyFields } from '../../shopify/store/html'
import { seoFields, templateField } from './shared'

// ストアのページ（shop.85-store.com/pages/<handle>）
export const StorePages: CollectionConfig = {
  slug: 'storePages',
  labels: { singular: 'ページ', plural: 'ページ' },
  access: { read: loggedIn, create: loggedIn, update: loggedIn, delete: adminOnly },
  admin: {
    group: 'ストア（shop.85-store.com）',
    useAsTitle: 'title',
    defaultColumns: ['title', 'handle', 'isPublished', 'shopify.syncStatus'],
    description: 'Shopify のストアのページです。保存すると Shopify に反映します。',
  },
  endpoints: [storeRefreshEndpoint('storePages')],
  hooks: storeHooks('storePages', ['body']),
  fields: [
    { name: 'title', label: 'タイトル', type: 'text', required: true },
    handleField(),
    ...bodyFields('body', '本文'),
    ...seoFields(),
    { name: 'isPublished', label: '公開する', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    templateField(),
    syncSidebar(),
  ],
}
