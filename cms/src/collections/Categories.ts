import type { CollectionConfig } from 'payload'
import { loggedIn } from '../access'
import { scheduleExport } from '../publish/schedule'

// カテゴリ。名前はそのまま URL（/blog/category/<名前>）に使う。
// Event1st / Event2nd は Reserve ページのイベント一覧に使っているので、名前を変えないこと。
export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'カテゴリ', plural: 'カテゴリ' },
  access: { read: () => true, create: loggedIn, update: loggedIn, delete: loggedIn },
  admin: { group: 'サイト（85-store.com）', useAsTitle: 'name', description: '名前はサイトの URL になります。Event1st / Event2nd は Reserve ページのイベント一覧に使っています。' },
  hooks: {
    afterChange: [({ doc, req }) => scheduleExport(req.payload, `categories:${doc.id}`)],
    afterDelete: [({ doc, req }) => scheduleExport(req.payload, `categories:${doc.id}:delete`)],
  },
  fields: [{ name: 'name', label: '名前', type: 'text', required: true, unique: true }],
}
