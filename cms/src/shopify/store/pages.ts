import { shopifyGraphQL } from '../client'
import { type SeoMeta, SEO_QUERY, check, deleteMetafields, registerResource, seoMetafields, text } from './engine'
import { htmlToLexical, isSimpleHtml } from './html'

// ストアのページ（shop.85-store.com/pages/...）とブログ

type ShopifyPage = SeoMeta & {
  id: string
  title: string
  handle: string
  body: string
  isPublished: boolean
  templateSuffix: string | null
  updatedAt: string
}

const PAGE_FIELDS = `id title handle body isPublished templateSuffix updatedAt ${SEO_QUERY}`

// 本文の編集のしかた（HTML のまま編集していたものは HTML のまま。見たままでも、扱えない HTML になったら HTML にする）
export const bodyMode = (html: string, existing: Record<string, unknown> | undefined, key: string) =>
  existing?.[key] === 'html' || !isSimpleHtml(html) ? 'html' : 'visual'

registerResource<ShopifyPage>({
  collection: 'storePages',
  label: 'ページ',
  bodies: ['body'],
  keepOnWriteBack: ['bodyRich', 'bodyMode'],
  fieldLabels: { title: 'タイトル', handle: 'handle', body: '本文', isPublished: '公開', templateSuffix: 'テンプレート', seoTitle: '検索結果のタイトル', seoDescription: '検索結果の説明' },
  async fetchAll() {
    const data = await shopifyGraphQL<{ pages: { nodes: ShopifyPage[] } }>(`{ pages(first: 250) { nodes { ${PAGE_FIELDS} } } }`)
    return data.pages.nodes
  },
  async fetchOne(id) {
    const data = await shopifyGraphQL<{ page: ShopifyPage | null }>(`query($id: ID!) { page(id: $id) { ${PAGE_FIELDS} } }`, { id })
    return data.page
  },
  canonical: (p) => ({
    title: p.title,
    handle: p.handle,
    body: p.body,
    isPublished: p.isPublished,
    templateSuffix: p.templateSuffix || null,
    seoTitle: p.titleTag?.value || null,
    seoDescription: p.descriptionTag?.value || null,
  }),
  desired: async (doc) => ({
    title: doc.title,
    handle: text(doc.handle),
    body: (doc.body as string | null) ?? '',
    isPublished: Boolean(doc.isPublished),
    templateSuffix: text(doc.templateSuffix),
    seoTitle: text(doc.seoTitle),
    seoDescription: text(doc.seoDescription),
  }),
  toDoc: async (p, lookup, existing) => {
    const mode = bodyMode(p.body, existing, 'bodyMode')
    return {
      title: p.title,
      handle: p.handle,
      body: p.body,
      bodyMode: mode,
      bodyRich: mode === 'visual' ? htmlToLexical(lookup.payload, 'storePages', 'bodyRich', p.body) : null,
      isPublished: p.isPublished,
      templateSuffix: p.templateSuffix || null,
      seoTitle: p.titleTag?.value || null,
      seoDescription: p.descriptionTag?.value || null,
    }
  },
  async create(desired) {
    const { set } = seoMetafields(null, desired)
    const res = await shopifyGraphQL<{ pageCreate: { page: { id: string } | null; userErrors: { field: string[] | null; message: string }[] } }>(
      `mutation($page: PageCreateInput!) { pageCreate(page: $page) { page { id } userErrors { field message } } }`,
      {
        page: {
          title: desired.title,
          ...(desired.handle ? { handle: desired.handle } : {}),
          body: desired.body,
          isPublished: desired.isPublished,
          ...(desired.templateSuffix ? { templateSuffix: desired.templateSuffix } : {}),
          ...(set.length ? { metafields: set } : {}),
        },
      },
    )
    check('pageCreate', res.pageCreate.userErrors)
    return res.pageCreate.page!.id
  },
  async update(id, desired, current) {
    const { set, remove } = seoMetafields(current, desired)
    const res = await shopifyGraphQL<{ pageUpdate: { userErrors: { field: string[] | null; message: string }[] } }>(
      `mutation($id: ID!, $page: PageUpdateInput!) { pageUpdate(id: $id, page: $page) { userErrors { field message } } }`,
      {
        id,
        page: {
          title: desired.title,
          ...(desired.handle && desired.handle !== current.handle ? { handle: desired.handle, redirectNewHandle: true } : {}),
          body: desired.body,
          isPublished: desired.isPublished,
          templateSuffix: desired.templateSuffix ?? '',
          ...(set.length ? { metafields: set } : {}),
        },
      },
    )
    check('pageUpdate', res.pageUpdate.userErrors)
    await deleteMetafields(id, remove)
  },
  async remove(id) {
    const res = await shopifyGraphQL<{ pageDelete: { userErrors: { field: string[] | null; message: string }[] } }>(
      `mutation($id: ID!) { pageDelete(id: $id) { userErrors { field message } } }`,
      { id },
    )
    check('pageDelete', res.pageDelete.userErrors)
  },
})

type ShopifyBlog = { id: string; title: string; handle: string; commentPolicy: string; templateSuffix: string | null; updatedAt: string }
const BLOG_FIELDS = 'id title handle commentPolicy templateSuffix updatedAt'

registerResource<ShopifyBlog>({
  collection: 'storeBlogs',
  label: 'ブログ',
  fieldLabels: { title: 'タイトル', handle: 'handle', commentPolicy: 'コメント', templateSuffix: 'テンプレート' },
  async fetchAll() {
    const data = await shopifyGraphQL<{ blogs: { nodes: ShopifyBlog[] } }>(`{ blogs(first: 250) { nodes { ${BLOG_FIELDS} } } }`)
    return data.blogs.nodes
  },
  async fetchOne(id) {
    const data = await shopifyGraphQL<{ blog: ShopifyBlog | null }>(`query($id: ID!) { blog(id: $id) { ${BLOG_FIELDS} } }`, { id })
    return data.blog
  },
  canonical: (b) => ({ title: b.title, handle: b.handle, commentPolicy: b.commentPolicy, templateSuffix: b.templateSuffix || null }),
  desired: async (doc) => ({
    title: doc.title,
    handle: text(doc.handle),
    commentPolicy: doc.commentPolicy ?? 'CLOSED',
    templateSuffix: text(doc.templateSuffix),
  }),
  toDoc: async (b) => ({ title: b.title, handle: b.handle, commentPolicy: b.commentPolicy, templateSuffix: b.templateSuffix || null }),
  async create(desired) {
    const res = await shopifyGraphQL<{ blogCreate: { blog: { id: string } | null; userErrors: { field: string[] | null; message: string }[] } }>(
      `mutation($blog: BlogCreateInput!) { blogCreate(blog: $blog) { blog { id } userErrors { field message } } }`,
      {
        blog: {
          title: desired.title,
          ...(desired.handle ? { handle: desired.handle } : {}),
          commentPolicy: desired.commentPolicy,
          ...(desired.templateSuffix ? { templateSuffix: desired.templateSuffix } : {}),
        },
      },
    )
    check('blogCreate', res.blogCreate.userErrors)
    return res.blogCreate.blog!.id
  },
  async update(id, desired, current) {
    const res = await shopifyGraphQL<{ blogUpdate: { userErrors: { field: string[] | null; message: string }[] } }>(
      `mutation($id: ID!, $blog: BlogUpdateInput!) { blogUpdate(id: $id, blog: $blog) { userErrors { field message } } }`,
      {
        id,
        blog: {
          title: desired.title,
          ...(desired.handle && desired.handle !== current.handle ? { handle: desired.handle, redirectNewHandle: true, redirectArticles: true } : {}),
          commentPolicy: desired.commentPolicy,
          templateSuffix: desired.templateSuffix ?? '',
        },
      },
    )
    check('blogUpdate', res.blogUpdate.userErrors)
  },
  async remove(id) {
    const res = await shopifyGraphQL<{ blogDelete: { userErrors: { field: string[] | null; message: string }[] } }>(
      `mutation($id: ID!) { blogDelete(id: $id) { userErrors { field message } } }`,
      { id },
    )
    check('blogDelete', res.blogDelete.userErrors)
  },
})
