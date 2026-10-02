import type { CollectionConfig } from 'payload'
import { loggedIn } from '../access'

// ブランド。商品名の [BRAND] と、メタフィールド custom.brand に使う
export const Brands: CollectionConfig = {
  slug: 'brands',
  labels: { singular: 'ブランド', plural: 'ブランド' },
  access: { read: loggedIn, create: loggedIn, update: loggedIn, delete: loggedIn },
  admin: { useAsTitle: 'name', group: '商品', defaultColumns: ['name', 'titleLabel'] },
  fields: [
    { name: 'name', label: '名前', type: 'text', required: true, unique: true },
    {
      name: 'titleLabel',
      label: '商品名での表記',
      type: 'text',
      admin: { description: '商品名の [ ] に入れる表記（例: River）。空なら名前を使います。' },
    },
  ],
}
