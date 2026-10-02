import type { CollectionConfig } from 'payload'
import { BlocksFeature, FixedToolbarFeature, lexicalEditor, UploadFeature } from '@payloadcms/richtext-lexical'
import { loggedIn } from '../access'
import { EmbedBlock } from '../blocks/Embed'
import { GalleryBlock } from '../blocks/Gallery'
import { scheduleExport } from '../publish/schedule'

// 本文で使わない機能（サイトの表示が対応していないもの）
const UNUSED_FEATURES = ['upload', 'relationship', 'checklist', 'subscript', 'superscript', 'inlineCode', 'indent', 'align']

// スラッグが空なら日付と短い乱数で作る（日本語のタイトルは URL に向かないため）
function defaultSlug(): string {
  const date = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' })
  return `${date}-${Math.random().toString(36).slice(2, 6)}`
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: '記事', plural: '記事' },
  access: {
    // 公開APIは使わない（サイトは R2 に書き出した JSON を読む）
    read: loggedIn,
    create: loggedIn,
    update: loggedIn,
    delete: loggedIn,
  },
  admin: { group: 'サイト（85-store.com）',
    useAsTitle: 'title',
    defaultColumns: ['title', 'categories', '_status', 'publishedAt'],
    listSearchableFields: ['title', 'slug'],
  },
  defaultSort: '-publishedAt',
  versions: { drafts: { autosave: { interval: 2000 } }, maxPerDoc: 30 },
  hooks: {
    beforeChange: [
      ({ data }) => {
        // 初めて公開したときの日時を公開日にする
        if (data._status === 'published' && !data.publishedAt) data.publishedAt = new Date().toISOString()
        return data
      },
    ],
    afterChange: [({ doc, req }) => scheduleExport(req.payload, `posts:${doc.id}`)],
    afterDelete: [({ doc, req }) => scheduleExport(req.payload, `posts:${doc.id}:delete`)],
  },
  fields: [
    { name: 'title', label: 'タイトル', type: 'text', required: true },
    {
      name: 'content',
      label: '本文',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures.filter((feature) => !UNUSED_FEATURES.includes(feature.key)),
          UploadFeature({ collections: { media: { fields: [{ name: 'caption', label: 'キャプション', type: 'text' }] } } }),
          BlocksFeature({ blocks: [GalleryBlock, EmbedBlock] }),
          FixedToolbarFeature(),
        ],
      }),
    },
    {
      type: 'row',
      fields: [
        { name: 'eyecatch', label: 'アイキャッチ', type: 'upload', relationTo: 'media' },
      ],
    },
    { name: 'description', label: '説明文（検索結果や SNS に出る）', type: 'textarea' },
    { name: 'excerpt', label: '抜粋', type: 'textarea', admin: { condition: (data) => Boolean(data?.excerpt) } },
    {
      name: 'slug',
      label: 'スラッグ（URL）',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: '半角英数とハイフン。空なら日付から作ります。' },
      hooks: { beforeValidate: [({ value }) => (typeof value === 'string' && value.trim() ? value.trim() : defaultSlug())] },
      validate: (value: unknown) =>
        typeof value === 'string' && /^[A-Za-z0-9_-]+$/.test(value) ? true : '半角英数・ハイフン・アンダースコアだけで入力してください',
    },
    { name: 'publishedAt', label: '公開日', type: 'date', admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'categories', label: 'カテゴリ', type: 'relationship', relationTo: 'categories', hasMany: true, admin: { position: 'sidebar' } },
    { name: 'tags', label: 'タグ', type: 'text', hasMany: true, admin: { position: 'sidebar' } },
    { name: 'featured', label: '注目の記事', type: 'checkbox', admin: { position: 'sidebar' } },
    { name: 'author', label: '書いた人', type: 'text', admin: { position: 'sidebar' } },
    // microCMS のコンテンツID（旧 URL /blog/<ID> からのリダイレクトに使う）
    { name: 'legacyId', type: 'text', index: true, admin: { position: 'sidebar', readOnly: true, condition: (data) => Boolean(data?.legacyId) } },
  ],
}
