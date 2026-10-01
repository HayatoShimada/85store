/**
 * microCMS から Payload へ移行する（何度実行しても重複しない。legacyId / sourceUrl で上書き）
 *
 *   npm run migrate:microcms
 *
 * - microCMS の API キーはリポジトリ直下の .env.local（MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY）から読む
 * - 画像は元の画像（クエリなし）をダウンロードして media に登録する（data/microcms-cache/ に保存し、再実行時は使い回す）
 * - 本文の HTML は Lexical に変換する。<figure><img> は写真、<iframe> は埋め込みブロックにする
 * - 最後に書き出しを行い、元の HTML と書き出した HTML を比べたレポートを data/migration-report.json に出す
 */
import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import dotenv from 'dotenv'
import { JSDOM } from 'jsdom'
import { getPayload, type Payload, type RichTextField } from 'payload'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import config from '@payload-config'
import { exportAll } from '../src/publish/export'
import { contentToHTML } from '../src/publish/html'
import type { EmbedShape } from '../src/lib/embed'

dotenv.config({ path: path.resolve(process.cwd(), '../.env.local') })
process.env.CMS_DISABLE_AUTO_EXPORT = '1'

type MicroImage = { url: string; width?: number; height?: number }
type MicroBlog = {
  id: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
  revisedAt?: string
  title: string
  slug?: string
  content?: string
  eyecatch?: MicroImage
  featured?: boolean
  category?: string[]
  tags?: string[]
  author?: string
  excerpt?: string
  description?: string
}
type MicroBanner = { id: string; image: MicroImage; title?: string; subtitle?: string; detailButtonUrl?: string; order?: number }

const CACHE_DIR = path.resolve('data/microcms-cache')

async function fetchAll<T>(endpoint: string): Promise<T[]> {
  const domain = process.env.MICROCMS_SERVICE_DOMAIN
  const key = process.env.MICROCMS_API_KEY
  if (!domain || !key) throw new Error('MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY が .env.local にありません')
  const items: T[] = []
  for (let offset = 0; ; offset += 100) {
    const res = await fetch(`https://${domain}.microcms.io/api/v1/${endpoint}?limit=100&offset=${offset}`, {
      headers: { 'X-MICROCMS-API-KEY': key },
    })
    if (!res.ok) throw new Error(`microCMS ${endpoint}: ${res.status}`)
    const body = (await res.json()) as { contents: T[]; totalCount: number }
    items.push(...body.contents)
    if (items.length >= body.totalCount) return items
  }
}

const originalUrl = (src: string) => {
  const url = new URL(src.replace(/&amp;/g, '&'))
  url.search = ''
  return url.toString()
}

// 画像をダウンロードして media に登録する（登録済みならそれを使う）
async function ensureMedia(payload: Payload, src: string, alt: string): Promise<number> {
  const sourceUrl = originalUrl(src)
  const existing = await payload.find({ collection: 'media', where: { sourceUrl: { equals: sourceUrl } }, limit: 1, depth: 0 })
  if (existing.docs[0]) return existing.docs[0].id

  const name = decodeURIComponent(new URL(sourceUrl).pathname.split('/').pop() || 'image')
  const cacheFile = path.join(CACHE_DIR, crypto.createHash('sha1').update(sourceUrl).digest('hex') + path.extname(name))
  let data: Buffer
  try {
    data = await fs.readFile(cacheFile)
  } catch {
    const res = await fetch(sourceUrl)
    if (!res.ok) throw new Error(`画像を取得できません: ${sourceUrl} (${res.status})`)
    data = Buffer.from(await res.arrayBuffer())
    await fs.mkdir(CACHE_DIR, { recursive: true })
    await fs.writeFile(cacheFile, data)
  }
  const ext = path.extname(name).toLowerCase()
  const mimetype = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : ext === '.gif' ? 'image/gif' : 'image/jpeg'
  const doc = await payload.create({
    collection: 'media',
    data: { alt, sourceUrl },
    file: { data, mimetype, name, size: data.length },
  })
  console.log(`  画像: ${name}`)
  return doc.id
}

const nodeId = () => crypto.randomBytes(12).toString('hex')

// 埋め込みの形を、microCMS の HTML（padding-bottom / height）から決める
function shapeOf(wrapper: Element): EmbedShape {
  const style = wrapper.outerHTML
  if (/height:\s*152px/.test(style)) return 'compact'
  if (/padding-bottom:\s*177\./.test(style)) return '9:16'
  if (/padding-bottom:\s*75%/.test(style)) return '4:3'
  if (/padding-bottom:\s*56\.25%/.test(style)) return '16:9'
  return 'auto'
}

async function htmlToLexical(payload: Payload, html: string) {
  const posts = payload.config.collections.find((c) => c.slug === 'posts')!
  const field = posts.fields.find((f) => 'name' in f && f.name === 'content') as RichTextField
  const editorConfig = editorConfigFactory.fromField({ field })

  const { document } = new JSDOM(`<body>${html}</body>`).window
  const children: unknown[] = []
  let buffer = ''
  const flush = () => {
    if (!buffer.trim()) return (buffer = '')
    const state = convertHTMLToLexical({ editorConfig, html: buffer, JSDOM })
    children.push(...(state.root.children as unknown[]))
    buffer = ''
  }

  for (const element of Array.from(document.body.children)) {
    const img = element.tagName === 'FIGURE' ? element.querySelector('img') : null
    const iframe = element.tagName === 'DIV' ? element.querySelector('iframe') : null
    if (img?.getAttribute('src')) {
      flush()
      const caption = element.querySelector('figcaption')?.textContent?.trim()
      const mediaId = await ensureMedia(payload, img.getAttribute('src')!, img.getAttribute('alt') ?? '')
      children.push({
        type: 'upload',
        version: 3,
        format: '',
        id: nodeId(),
        relationTo: 'media',
        value: mediaId,
        fields: caption ? { caption } : {},
      })
    } else if (iframe?.getAttribute('src')) {
      flush()
      children.push({
        type: 'block',
        version: 2,
        format: '',
        fields: { id: nodeId(), blockName: '', blockType: 'embed', url: iframe.getAttribute('src'), shape: shapeOf(element) },
      })
    } else {
      buffer += element.outerHTML
    }
  }
  flush()
  return { root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children } }
}

async function upsert(payload: Payload, collection: 'posts' | 'banners', legacyId: string, data: Record<string, unknown>) {
  const found = await payload.find({ collection, where: { legacyId: { equals: legacyId } }, limit: 1, depth: 0, draft: true })
  if (found.docs[0]) {
    return payload.update({ collection, id: found.docs[0].id, data: data as never, draft: false })
  }
  return payload.create({ collection, data: { ...data, legacyId } as never, draft: false })
}

// 比較用: タグを除いたテキスト
const textOf = (html: string) =>
  new JSDOM(`<body>${html}</body>`).window.document.body.textContent!.replace(/\s+/g, '').trim()
const imagesIn = (html: string) => (html.match(/<img\b/g) ?? []).length
const iframesIn = (html: string) => (html.match(/<iframe\b/g) ?? []).length

async function main() {
  const payload = await getPayload({ config })
  const blogs = await fetchAll<MicroBlog>('blogs')
  const banners = await fetchAll<MicroBanner>('banners')
  console.log(`microCMS: 記事 ${blogs.length} 件・バナー ${banners.length} 件`)

  // カテゴリ
  const categoryIds = new Map<string, number>()
  for (const name of new Set(blogs.flatMap((b) => b.category ?? []))) {
    const found = await payload.find({ collection: 'categories', where: { name: { equals: name } }, limit: 1 })
    categoryIds.set(name, found.docs[0]?.id ?? (await payload.create({ collection: 'categories', data: { name } })).id)
  }

  // 記事（古い順に入れる）
  for (const blog of [...blogs].reverse()) {
    console.log(`記事: ${blog.title}`)
    const content = await htmlToLexical(payload, blog.content ?? '')
    const eyecatch = blog.eyecatch ? await ensureMedia(payload, blog.eyecatch.url, blog.title) : null
    const post = await upsert(payload, 'posts', blog.id, {
      title: blog.title,
      slug: blog.slug || blog.id,
      content,
      eyecatch,
      categories: (blog.category ?? []).map((name) => categoryIds.get(name)),
      tags: blog.tags ?? [],
      author: blog.author ?? null,
      excerpt: blog.excerpt ?? null,
      description: blog.description ?? null,
      featured: Boolean(blog.featured),
      publishedAt: blog.publishedAt ?? blog.createdAt,
      _status: 'published',
    })
    // 作成日・更新日は microCMS のものを引き継ぐ（サイトマップの lastmod に使う）。DB を直接書き換える
    await payload.db.updateOne({
      collection: 'posts',
      id: post.id,
      data: { createdAt: blog.createdAt, updatedAt: blog.revisedAt ?? blog.updatedAt },
      returning: false,
    })
  }

  // バナー（並び順どおりに入れる）
  for (const banner of [...banners].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))) {
    console.log(`バナー: ${banner.title ?? banner.id}`)
    const image = await ensureMedia(payload, banner.image.url, banner.title ?? '')
    await upsert(payload, 'banners', banner.id, {
      image,
      title: banner.title ?? null,
      subtitle: banner.subtitle ?? null,
      detailButtonUrl: banner.detailButtonUrl ?? null,
    })
  }

  // 書き出しと検証
  const result = await exportAll(payload)
  const { docs } = await payload.find({ collection: 'posts', depth: 2, limit: 0, pagination: false, where: { legacyId: { exists: true } } })
  const byLegacy = new Map(docs.map((doc) => [doc.legacyId, doc]))
  const report = blogs.map((blog) => {
    const doc = byLegacy.get(blog.id)
    const before = blog.content ?? ''
    const after = doc ? contentToHTML(doc.content) : ''
    return {
      id: blog.id,
      title: blog.title,
      found: Boolean(doc),
      textSame: textOf(before) === textOf(after),
      images: [imagesIn(before), imagesIn(after)],
      embeds: [iframesIn(before), iframesIn(after)],
    }
  })
  const problems = report.filter((r) => !r.found || !r.textSame || r.images[0] !== r.images[1] || r.embeds[0] !== r.embeds[1])
  const media = await payload.count({ collection: 'media' })
  await fs.writeFile('data/migration-report.json', JSON.stringify({ result, media: media.totalDocs, problems, report }, null, 2))
  console.log(`書き出し: 記事 ${result.posts} 件・バナー ${result.banners} 件・画像 ${media.totalDocs} 枚`)
  console.log(problems.length ? `違いのある記事: ${problems.length} 件（data/migration-report.json）` : '本文のテキスト・画像・埋め込みはすべて一致しました')
  process.exit(problems.length ? 1 : 0)
}

// payload run は読み込みが終わると終了するので、トップレベルで待つ
await main().catch((error) => {
  console.error(error)
  process.exit(1)
})
