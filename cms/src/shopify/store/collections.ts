import { shopifyGraphQL } from '../client'
import { publishToAllChannels } from '../sync'
import { type Lookup, type ResourceDef, check, registerResource, text } from './engine'
import { htmlToLexical } from './html'
import { bodyMode } from './pages'
import { imageOf, newImageUrl } from './articles'

// Shopify のコレクション（自動: 条件で商品が決まる / 手動: 商品を選ぶ）

type Rule = { column: string; relation: string; condition: string; conditionObjectId: string | null }
type ShopifyCollection = {
  id: string
  title: string
  handle: string
  descriptionHtml: string
  sortOrder: string
  templateSuffix: string | null
  updatedAt: string
  image: { url: string; altText: string | null } | null
  seo: { title: string | null; description: string | null }
  ruleSet: { appliedDisjunctively: boolean; rules: Rule[] } | null
  products: string[] | null // 手動のときだけ（並び順どおり）
}

type RawCollection = Omit<ShopifyCollection, 'ruleSet' | 'products'> & {
  ruleSet: {
    appliedDisjunctively: boolean
    rules: { column: string; relation: string; condition: string; conditionObject: { metafieldDefinition?: { id: string } } | null }[]
  } | null
}

const COLLECTION_FIELDS = `id title handle descriptionHtml sortOrder templateSuffix updatedAt image { url altText } seo { title description }
  ruleSet { appliedDisjunctively rules { column relation condition conditionObject { ... on CollectionRuleMetafieldCondition { metafieldDefinition { id } } } } }`

async function manualProducts(id: string): Promise<string[]> {
  const ids: string[] = []
  let after: string | null = null
  do {
    const data: { collection: { products: { nodes: { id: string }[]; pageInfo: { hasNextPage: boolean; endCursor: string } } } } = await shopifyGraphQL(
      `query($id: ID!, $after: String) { collection(id: $id) { products(first: 250, after: $after, sortKey: COLLECTION_DEFAULT) { pageInfo { hasNextPage endCursor } nodes { id } } } }`,
      { id, after },
    )
    ids.push(...data.collection.products.nodes.map((p) => p.id))
    after = data.collection.products.pageInfo.hasNextPage ? data.collection.products.pageInfo.endCursor : null
  } while (after)
  return ids
}

async function complete(raw: RawCollection): Promise<ShopifyCollection> {
  return {
    ...raw,
    ruleSet: raw.ruleSet && {
      appliedDisjunctively: raw.ruleSet.appliedDisjunctively,
      rules: raw.ruleSet.rules.map((r) => ({
        column: r.column,
        relation: r.relation,
        condition: r.condition,
        conditionObjectId: r.conditionObject?.metafieldDefinition?.id ?? null,
      })),
    },
    products: raw.ruleSet ? null : await manualProducts(raw.id),
  }
}

// 条件の値（サイズのメタオブジェクト・カテゴリの ID）を、人が読める名前にする
async function conditionLabels(rules: Rule[]): Promise<Map<string, string>> {
  const ids = [...new Set(rules.map((r) => r.condition).filter((c) => c.startsWith('gid://')))]
  if (!ids.length) return new Map()
  const data = await shopifyGraphQL<{ nodes: ({ id: string; displayName?: string; fullName?: string } | null)[] }>(
    `query($ids: [ID!]!) { nodes(ids: $ids) { id ... on Metaobject { displayName } ... on TaxonomyCategory { fullName } } }`,
    { ids },
  ).catch(() => ({ nodes: [] }))
  return new Map(data.nodes.filter((n) => n).map((n) => [n!.id, n!.displayName ?? n!.fullName ?? '']))
}

// 並び順が手動のときは順番も比べる。それ以外は集合として比べる
const productList = (ids: string[], sortOrder: unknown) => (sortOrder === 'MANUAL' ? ids : [...ids].sort())

type DocRule = { column?: string; relation?: string; condition?: string; conditionObjectId?: string | null }

async function productIds(doc: Record<string, unknown>, lookup: Lookup): Promise<string[]> {
  const ids: string[] = []
  for (const product of (doc.products as unknown[] | null) ?? []) {
    const gid = await lookup.gid('products', product)
    if (gid) ids.push(gid)
  }
  return ids
}

// Shopify の非同期の処理（商品の追加・削除・並べ替え）が終わるのを待つ
async function waitJob(job: { id: string } | null | undefined) {
  if (!job) return
  for (let i = 0; i < 30; i++) {
    const data = await shopifyGraphQL<{ job: { done: boolean } | null }>(`query($id: ID!) { job(id: $id) { done } }`, { id: job.id })
    if (!data.job || data.job.done) return
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  throw new Error('Shopify の処理が終わりません（コレクションの商品の更新）')
}

const def: ResourceDef<ShopifyCollection> = {
  collection: 'shopifyCollections',
  label: 'コレクション',
  bodies: ['descriptionHtml'],
  keepOnWriteBack: ['descriptionHtmlRich', 'descriptionHtmlMode', 'kind'],
  fieldLabels: {
    title: 'タイトル',
    handle: 'handle',
    descriptionHtml: '説明',
    sortOrder: '並び順',
    templateSuffix: 'テンプレート',
    image: '画像',
    seoTitle: '検索結果のタイトル',
    seoDescription: '検索結果の説明',
    ruleSet: '条件',
    products: '商品',
  },
  async fetchAll() {
    const data = await shopifyGraphQL<{ collections: { nodes: RawCollection[] } }>(`{ collections(first: 250) { nodes { ${COLLECTION_FIELDS} } } }`)
    const items: ShopifyCollection[] = []
    for (const raw of data.collections.nodes) items.push(await complete(raw))
    return items
  },
  async fetchOne(id) {
    const data = await shopifyGraphQL<{ collection: RawCollection | null }>(`query($id: ID!) { collection(id: $id) { ${COLLECTION_FIELDS} } }`, { id })
    return data.collection ? complete(data.collection) : null
  },
  canonical: (c) => ({
    title: c.title,
    handle: c.handle,
    descriptionHtml: c.descriptionHtml,
    sortOrder: c.sortOrder,
    templateSuffix: c.templateSuffix || null,
    image: c.image ? { src: c.image.url, alt: c.image.altText || null } : null,
    seoTitle: c.seo.title || null,
    seoDescription: c.seo.description || null,
    ruleSet: c.ruleSet,
    products: c.products && productList(c.products, c.sortOrder),
  }),
  desired: async (doc, lookup) => {
    const smart = doc.kind === 'smart'
    return {
      title: doc.title,
      handle: text(doc.handle),
      descriptionHtml: (doc.descriptionHtml as string | null) ?? '',
      sortOrder: doc.sortOrder ?? 'BEST_SELLING',
      templateSuffix: text(doc.templateSuffix),
      image: imageOf(doc),
      seoTitle: text(doc.seoTitle),
      seoDescription: text(doc.seoDescription),
      ruleSet: smart
        ? {
            appliedDisjunctively: doc.appliedDisjunctively === true,
            rules: ((doc.rules as DocRule[] | null) ?? []).map((r) => ({
              column: r.column ?? 'TITLE',
              relation: r.relation ?? 'CONTAINS',
              condition: r.condition ?? '',
              conditionObjectId: r.conditionObjectId || null,
            })),
          }
        : null,
      products: smart ? null : productList(await productIds(doc, lookup), doc.sortOrder),
    }
  },
  toDoc: async (c, lookup, existing) => {
    const mode = bodyMode(c.descriptionHtml, existing, 'descriptionHtmlMode')
    const labels = await conditionLabels(c.ruleSet?.rules ?? [])
    const products: number[] = []
    for (const gid of c.products ?? []) {
      const id = await lookup.id('products', gid)
      if (id) products.push(id)
    }
    return {
      kind: c.ruleSet ? 'smart' : 'manual',
      title: c.title,
      handle: c.handle,
      descriptionHtml: c.descriptionHtml,
      descriptionHtmlMode: mode,
      descriptionHtmlRich: mode === 'visual' ? htmlToLexical(lookup.payload, 'shopifyCollections', 'descriptionHtmlRich', c.descriptionHtml) : null,
      sortOrder: c.sortOrder,
      templateSuffix: c.templateSuffix || null,
      image: null,
      imageUrl: c.image?.url ?? null,
      imageAlt: c.image?.altText || null,
      seoTitle: c.seo.title || null,
      seoDescription: c.seo.description || null,
      appliedDisjunctively: c.ruleSet?.appliedDisjunctively ?? false,
      rules: (c.ruleSet?.rules ?? []).map((r) => ({ ...r, conditionLabel: labels.get(r.condition) || null })),
      products,
    }
  },
  async create(desired, doc) {
    const url = newImageUrl(doc)
    const res = await shopifyGraphQL<{ collectionCreate: { collection: { id: string } | null; userErrors: { field: string[] | null; message: string }[] } }>(
      `mutation($input: CollectionInput!) { collectionCreate(input: $input) { collection { id } userErrors { field message } } }`,
      {
        input: {
          title: desired.title,
          ...(desired.handle ? { handle: desired.handle } : {}),
          descriptionHtml: desired.descriptionHtml,
          sortOrder: desired.sortOrder,
          ...(desired.templateSuffix ? { templateSuffix: desired.templateSuffix } : {}),
          ...(url ? { image: { src: url, ...(text(doc.imageAlt) ? { altText: doc.imageAlt } : {}) } } : {}),
          ...(desired.seoTitle || desired.seoDescription ? { seo: { title: desired.seoTitle ?? '', description: desired.seoDescription ?? '' } } : {}),
          ...(desired.ruleSet ? { ruleSet: desired.ruleSet } : { products: desired.products }),
        },
      },
    )
    check('collectionCreate', res.collectionCreate.userErrors)
    const id = res.collectionCreate.collection!.id
    // 既存のコレクションと同じく、すべての販売チャネルに出す
    await publishToAllChannels(id)
    return id
  },
  async update(id, desired, current, doc) {
    const url = newImageUrl(doc)
    const alt = text(doc.imageAlt)
    const altChanged = current.image && (current.image.altText || null) !== alt
    const res = await shopifyGraphQL<{ collectionUpdate: { userErrors: { field: string[] | null; message: string }[] } }>(
      `mutation($input: CollectionInput!) { collectionUpdate(input: $input) { userErrors { field message } } }`,
      {
        input: {
          id,
          title: desired.title,
          ...(desired.handle && desired.handle !== current.handle ? { handle: desired.handle, redirectNewHandle: true } : {}),
          descriptionHtml: desired.descriptionHtml,
          sortOrder: desired.sortOrder,
          templateSuffix: desired.templateSuffix ?? '',
          ...(url ? { image: { src: url, altText: alt ?? '' } } : altChanged ? { image: { src: current.image!.url, altText: alt ?? '' } } : {}),
          ...((current.seo.title || null) !== desired.seoTitle || (current.seo.description || null) !== desired.seoDescription
            ? { seo: { title: desired.seoTitle ?? '', description: desired.seoDescription ?? '' } }
            : {}),
          ...(desired.ruleSet ? { ruleSet: desired.ruleSet } : {}),
        },
      },
    )
    check('collectionUpdate', res.collectionUpdate.userErrors)

    // 手動のコレクション: 商品の追加・削除・並べ替え
    if (!desired.ruleSet && current.products) {
      const want = desired.products as string[]
      const have = new Set(current.products)
      const add = want.filter((p) => !have.has(p))
      const drop = current.products.filter((p) => !want.includes(p))
      if (add.length) {
        const r = await shopifyGraphQL<{ collectionAddProductsV2: { job: { id: string } | null; userErrors: { field: string[] | null; message: string }[] } }>(
          `mutation($id: ID!, $productIds: [ID!]!) { collectionAddProductsV2(id: $id, productIds: $productIds) { job { id } userErrors { field message } } }`,
          { id, productIds: add },
        )
        check('collectionAddProductsV2', r.collectionAddProductsV2.userErrors)
        await waitJob(r.collectionAddProductsV2.job)
      }
      if (drop.length) {
        const r = await shopifyGraphQL<{ collectionRemoveProducts: { job: { id: string } | null; userErrors: { field: string[] | null; message: string }[] } }>(
          `mutation($id: ID!, $productIds: [ID!]!) { collectionRemoveProducts(id: $id, productIds: $productIds) { job { id } userErrors { field message } } }`,
          { id, productIds: drop },
        )
        check('collectionRemoveProducts', r.collectionRemoveProducts.userErrors)
        await waitJob(r.collectionRemoveProducts.job)
      }
      if (desired.sortOrder === 'MANUAL' && want.length && JSON.stringify(want) !== JSON.stringify(current.products)) {
        const r = await shopifyGraphQL<{ collectionReorderProducts: { job: { id: string } | null; userErrors: { field: string[] | null; message: string }[] } }>(
          `mutation($id: ID!, $moves: [MoveInput!]!) { collectionReorderProducts(id: $id, moves: $moves) { job { id } userErrors { field message } } }`,
          { id, moves: want.map((productId, i) => ({ id: productId, newPosition: String(i) })) },
        )
        check('collectionReorderProducts', r.collectionReorderProducts.userErrors)
        await waitJob(r.collectionReorderProducts.job)
      }
    }
  },
  async remove(id) {
    const res = await shopifyGraphQL<{ collectionDelete: { userErrors: { field: string[] | null; message: string }[] } }>(
      `mutation($input: CollectionDeleteInput!) { collectionDelete(input: $input) { userErrors { field message } } }`,
      { input: { id } },
    )
    check('collectionDelete', res.collectionDelete.userErrors)
  },
}
registerResource(def)
