import type { Media } from '../../payload-types'
import { shopifyGraphQL } from '../client'
import { type ResourceDef, type SeoMeta, SEO_QUERY, check, deleteMetafields, registerResource, seoMetafields, text } from './engine'
import { htmlToLexical } from './html'
import { bodyMode } from './pages'

// ストアのブログの記事（shop.85-store.com/blogs/<ブログ>/<記事>）

type ShopifyArticle = SeoMeta & {
  id: string
  title: string
  handle: string
  body: string
  summary: string | null
  isPublished: boolean
  tags: string[]
  templateSuffix: string | null
  author: { name: string } | null
  image: { url: string; altText: string | null } | null
  blog: { id: string }
  updatedAt: string | null
}

const ARTICLE_FIELDS = `id title handle body summary isPublished tags templateSuffix author { name } image { url altText } blog { id } updatedAt ${SEO_QUERY}`

// 画像: 新しく選んだ「画像」（R2）は new:<ID>、それ以外は Shopify にある画像の URL
export const imageOf = (doc: Record<string, unknown>) => {
  const media = doc.image as Media | number | null | undefined
  const alt = text(doc.imageAlt)
  if (media) return { src: `new:${typeof media === 'object' ? media.id : media}`, alt }
  return doc.imageUrl ? { src: doc.imageUrl as string, alt } : null
}
export const newImageUrl = (doc: Record<string, unknown>) => {
  const media = doc.image as Media | number | null | undefined
  if (!media) return null
  if (typeof media !== 'object' || !media.url) throw new Error('画像のファイルが見つかりません')
  return media.url
}

const def: ResourceDef<ShopifyArticle> = {
  collection: 'storeArticles',
  label: '記事',
  bodies: ['body'],
  keepOnWriteBack: ['bodyRich', 'bodyMode'],
  fieldLabels: {
    blog: 'ブログ',
    title: 'タイトル',
    handle: 'handle',
    body: '本文',
    summary: '抜粋',
    isPublished: '公開',
    tags: 'タグ',
    templateSuffix: 'テンプレート',
    author: '書いた人',
    image: '画像',
    seoTitle: '検索結果のタイトル',
    seoDescription: '検索結果の説明',
  },
  async fetchAll() {
    const items: ShopifyArticle[] = []
    let after: string | null = null
    do {
      const data: { articles: { nodes: ShopifyArticle[]; pageInfo: { hasNextPage: boolean; endCursor: string } } } = await shopifyGraphQL(
        `query($after: String) { articles(first: 100, after: $after) { pageInfo { hasNextPage endCursor } nodes { ${ARTICLE_FIELDS} } } }`,
        { after },
      )
      items.push(...data.articles.nodes)
      after = data.articles.pageInfo.hasNextPage ? data.articles.pageInfo.endCursor : null
    } while (after)
    return items
  },
  async fetchOne(id) {
    const data = await shopifyGraphQL<{ article: ShopifyArticle | null }>(`query($id: ID!) { article(id: $id) { ${ARTICLE_FIELDS} } }`, { id })
    return data.article
  },
  canonical: (a) => ({
    blog: a.blog.id,
    title: a.title,
    handle: a.handle,
    body: a.body,
    summary: a.summary || null,
    isPublished: a.isPublished,
    tags: [...a.tags].sort(),
    templateSuffix: a.templateSuffix || null,
    author: a.author?.name || null,
    image: a.image ? { src: a.image.url, alt: a.image.altText || null } : null,
    seoTitle: a.titleTag?.value || null,
    seoDescription: a.descriptionTag?.value || null,
  }),
  desired: async (doc, lookup) => ({
    blog: await lookup.gid('storeBlogs', doc.blog),
    title: doc.title,
    handle: text(doc.handle),
    body: (doc.body as string | null) ?? '',
    summary: text(doc.summary),
    isPublished: Boolean(doc.isPublished),
    tags: [...((doc.tags as string[] | null) ?? [])].sort(),
    templateSuffix: text(doc.templateSuffix),
    author: text(doc.author),
    image: imageOf(doc),
    seoTitle: text(doc.seoTitle),
    seoDescription: text(doc.seoDescription),
  }),
  toDoc: async (a, lookup, existing) => {
    const mode = bodyMode(a.body, existing, 'bodyMode')
    return {
      blog: await lookup.id('storeBlogs', a.blog.id),
      title: a.title,
      handle: a.handle,
      body: a.body,
      bodyMode: mode,
      bodyRich: mode === 'visual' ? htmlToLexical(lookup.payload, 'storeArticles', 'bodyRich', a.body) : null,
      summary: a.summary || null,
      isPublished: a.isPublished,
      tags: a.tags,
      templateSuffix: a.templateSuffix || null,
      author: a.author?.name || null,
      image: null,
      imageUrl: a.image?.url ?? null,
      imageAlt: a.image?.altText || null,
      seoTitle: a.titleTag?.value || null,
      seoDescription: a.descriptionTag?.value || null,
    }
  },
  async create(desired, doc) {
    const { set } = seoMetafields(null, desired)
    const url = newImageUrl(doc)
    const res = await shopifyGraphQL<{ articleCreate: { article: { id: string } | null; userErrors: { field: string[] | null; message: string }[] } }>(
      `mutation($article: ArticleCreateInput!) { articleCreate(article: $article) { article { id } userErrors { field message } } }`,
      {
        article: {
          blogId: desired.blog,
          title: desired.title,
          ...(desired.handle ? { handle: desired.handle } : {}),
          body: desired.body,
          ...(desired.summary ? { summary: desired.summary } : {}),
          isPublished: desired.isPublished,
          tags: desired.tags,
          ...(desired.templateSuffix ? { templateSuffix: desired.templateSuffix } : {}),
          author: { name: desired.author ?? '85-Store' },
          ...(url ? { image: { url, ...(text(doc.imageAlt) ? { altText: doc.imageAlt } : {}) } } : {}),
          ...(set.length ? { metafields: set } : {}),
        },
      },
    )
    check('articleCreate', res.articleCreate.userErrors)
    return res.articleCreate.article!.id
  },
  async update(id, desired, current, doc) {
    const { set, remove } = seoMetafields(current, desired)
    const url = newImageUrl(doc)
    const alt = text(doc.imageAlt)
    const altChanged = current.image && (current.image.altText || null) !== alt
    const res = await shopifyGraphQL<{ articleUpdate: { userErrors: { field: string[] | null; message: string }[] } }>(
      `mutation($id: ID!, $article: ArticleUpdateInput!) { articleUpdate(id: $id, article: $article) { userErrors { field message } } }`,
      {
        id,
        article: {
          blogId: desired.blog,
          title: desired.title,
          ...(desired.handle && desired.handle !== current.handle ? { handle: desired.handle, redirectNewHandle: true } : {}),
          body: desired.body,
          summary: desired.summary ?? '',
          isPublished: desired.isPublished,
          tags: desired.tags,
          templateSuffix: desired.templateSuffix ?? '',
          ...(desired.author ? { author: { name: desired.author } } : {}),
          ...(url ? { image: { url, altText: alt ?? '' } } : altChanged ? { image: { url: current.image!.url, altText: alt ?? '' } } : {}),
          ...(set.length ? { metafields: set } : {}),
        },
      },
    )
    check('articleUpdate', res.articleUpdate.userErrors)
    await deleteMetafields(id, remove)
  },
  async remove(id) {
    const res = await shopifyGraphQL<{ articleDelete: { userErrors: { field: string[] | null; message: string }[] } }>(
      `mutation($id: ID!) { articleDelete(id: $id) { userErrors { field message } } }`,
      { id },
    )
    check('articleDelete', res.articleDelete.userErrors)
  },
}
registerResource(def)
