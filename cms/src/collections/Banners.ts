import type { CollectionConfig } from 'payload'
import { loggedIn } from '../access'
import { scheduleExport } from '../publish/schedule'

// トップページのバナー。縦長の画像はヒーローに、それ以外は Pick Up に出る（並び順どおり）
export const Banners: CollectionConfig = {
  slug: 'banners',
  labels: { singular: 'バナー', plural: 'バナー' },
  orderable: true,
  access: { read: loggedIn, create: loggedIn, update: loggedIn, delete: loggedIn },
  admin: { group: 'サイト（85-store.com）',
    useAsTitle: 'title',
    defaultColumns: ['title', 'image', 'updatedAt'],
    description: '縦長の画像はトップのヒーロー（先頭から2枚）、それ以外は Pick Up に並びます。ドラッグで並び替えできます。',
  },
  hooks: {
    afterChange: [({ doc, req }) => scheduleExport(req.payload, `banners:${doc.id}`)],
    afterDelete: [({ doc, req }) => scheduleExport(req.payload, `banners:${doc.id}:delete`)],
  },
  fields: [
    { name: 'image', label: '画像', type: 'upload', relationTo: 'media', required: true },
    { name: 'title', label: 'タイトル', type: 'text' },
    { name: 'subtitle', label: 'サブタイトル', type: 'text' },
    { name: 'detailButtonUrl', label: 'リンク先 URL（Pick Up のカードを押したときに開く）', type: 'text' },
    { name: 'legacyId', type: 'text', index: true, admin: { hidden: true } },
  ],
}
