import type { Field } from 'payload'

// ストアのコレクション・ページ・ブログ・記事・メニューで共通の欄

// 画像（Shopify にある画像の URL と、差し替えるときに選ぶ新しい画像）
export const imageFields = (): Field[] => [
  { name: 'imagePreview', type: 'ui', admin: { components: { Field: '/components/StoreImagePreview#StoreImagePreview' } } },
  {
    name: 'image',
    label: '新しい画像',
    type: 'upload',
    relationTo: 'media',
    admin: { description: '選んで保存すると Shopify の画像を差し替えます（画像は Shopify にコピーされます）。' },
  },
  { name: 'imageUrl', type: 'text', admin: { hidden: true } },
  { name: 'imageAlt', label: '画像の説明（代替テキスト）', type: 'text' },
]

export const seoFields = (): Field[] => [
  { name: 'seoTitle', label: '検索結果のタイトル', type: 'text' },
  { name: 'seoDescription', label: '検索結果の説明', type: 'textarea' },
]

export const templateField = (): Field => ({
  name: 'templateSuffix',
  label: 'テンプレート',
  type: 'text',
  admin: { position: 'sidebar', description: 'テーマのテンプレート（例: contact）。ふつうは空のままにします。' },
})
