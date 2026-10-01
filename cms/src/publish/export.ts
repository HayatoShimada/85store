import type { Payload } from 'payload'
import type { Banner, Category, Media, Post } from '../payload-types'
import { deleteKeys, listKeys, putObject } from '../lib/bucket'
import { contentToHTML } from './html'
import { exportImage, type ExportedImage } from './image'

// 公開中の記事・バナーを JSON にして R2（content/）に書き出す。サイトはこれだけを読む。
//   content/posts/index.json   一覧（本文なし）
//   content/posts/<slug>.json  記事（本文の HTML 込み）
//   content/banners.json       バナー（並び順どおり）

export type PostSummary = {
  id: string // microCMS から移した記事はそのコンテンツID（旧 URL のリダイレクトに使う）
  slug: string
  title: string
  eyecatch?: ExportedImage
  category: string[]
  tags: string[]
  author?: string
  excerpt?: string
  description?: string
  featured: boolean
  publishedAt: string
  createdAt: string
  updatedAt: string
}
export type ExportedPost = PostSummary & { content: string }
export type ExportedBanner = { id: string; image: ExportedImage; title?: string; subtitle?: string; detailButtonUrl?: string; order: number }

const json = (value: unknown) => JSON.stringify(value)
const optional = <K extends string>(key: K, value: string | null | undefined) =>
  (value ? { [key]: value } : {}) as Partial<Record<K, string>>

function summarize(post: Post): PostSummary {
  const eyecatch = post.eyecatch && typeof post.eyecatch === 'object' ? exportImage(post.eyecatch as Media) : null
  return {
    id: post.legacyId || String(post.id),
    slug: post.slug,
    title: post.title,
    ...(eyecatch ? { eyecatch } : {}),
    category: (post.categories ?? []).flatMap((c) => (typeof c === 'object' && c ? [(c as Category).name] : [])),
    tags: post.tags ?? [],
    ...optional('author', post.author),
    ...optional('excerpt', post.excerpt),
    ...optional('description', post.description),
    featured: Boolean(post.featured),
    publishedAt: post.publishedAt || post.createdAt,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  }
}

export async function exportAll(payload: Payload): Promise<{ posts: number; banners: number }> {
  const generatedAt = new Date().toISOString()

  const { docs: posts } = await payload.find({
    collection: 'posts',
    where: { _status: { equals: 'published' } },
    depth: 2,
    limit: 0,
    pagination: false,
    sort: '-publishedAt',
    overrideAccess: true,
  })
  const exported = posts.map((post) => ({ ...summarize(post), content: contentToHTML(post.content) }) satisfies ExportedPost)

  const keys = new Set<string>()
  for (const post of exported) {
    const key = `content/posts/${post.slug}.json`
    keys.add(key)
    await putObject(key, json(post), 'application/json; charset=utf-8')
  }
  const index = posts.map(summarize)
  await putObject('content/posts/index.json', json({ generatedAt, posts: index }), 'application/json; charset=utf-8')
  keys.add('content/posts/index.json')

  // 非公開・削除した記事のファイルを消す
  const stale = (await listKeys('content/posts/')).filter((key) => !keys.has(key))
  await deleteKeys(stale)

  const { docs: banners } = await payload.find({
    collection: 'banners',
    depth: 1,
    limit: 0,
    pagination: false,
    sort: '_order',
    overrideAccess: true,
  })
  const exportedBanners = (banners as Banner[]).flatMap((banner, order) => {
    const image = banner.image && typeof banner.image === 'object' ? exportImage(banner.image as Media) : null
    if (!image) return []
    return [
      {
        id: banner.legacyId || String(banner.id),
        image,
        ...optional('title', banner.title),
        ...optional('subtitle', banner.subtitle),
        ...optional('detailButtonUrl', banner.detailButtonUrl),
        order,
      } satisfies ExportedBanner,
    ]
  })
  await putObject('content/banners.json', json({ generatedAt, banners: exportedBanners }), 'application/json; charset=utf-8')

  return { posts: exported.length, banners: exportedBanners.length }
}
