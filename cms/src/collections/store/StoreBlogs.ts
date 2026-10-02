import type { CollectionConfig } from 'payload'
import { adminOnly, loggedIn } from '../../access'
import { handleField, storeHooks, storeRefreshEndpoint, syncSidebar } from '../../shopify/store'
import { templateField } from './shared'

// ストアのブログ（記事の入れ物。shop.85-store.com/blogs/<handle>）
export const StoreBlogs: CollectionConfig = {
  slug: 'storeBlogs',
  labels: { singular: 'ブログ', plural: 'ブログ' },
  access: { read: loggedIn, create: adminOnly, update: loggedIn, delete: adminOnly },
  admin: {
    group: 'ストア（shop.85-store.com）',
    useAsTitle: 'title',
    defaultColumns: ['title', 'handle', 'shopify.syncStatus'],
  },
  endpoints: [storeRefreshEndpoint('storeBlogs')],
  hooks: storeHooks('storeBlogs'),
  fields: [
    { name: 'title', label: 'タイトル', type: 'text', required: true },
    handleField('URL の末尾です。変えると、古い URL（記事を含む）から新しい URL へ自動で転送されます。'),
    {
      name: 'commentPolicy',
      label: 'コメント',
      type: 'select',
      required: true,
      defaultValue: 'CLOSED',
      options: [
        { label: '受け付けない', value: 'CLOSED' },
        { label: '承認してから表示', value: 'MODERATED' },
        { label: 'すぐに表示', value: 'AUTO_PUBLISHED' },
      ],
    },
    templateField(),
    syncSidebar(),
  ],
}
