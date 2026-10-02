import type { Payload, PayloadRequest, TaskConfig } from 'payload'
import type { Brand, Product } from '../payload-types'
import { revalidateSite } from '../publish/revalidate'
import { assertNoUserErrors, shopifyConfigured, shopifyGraphQL } from './client'
import {
  type CanonicalProduct,
  type Difference,
  type ShopifyProduct,
  PRODUCT_FIELDS,
  diffProducts,
  fingerprint,
  fromShopify,
} from './canonical'
import { canonicalFromDoc, docFromShopify, metafieldsFromDoc } from './mapping'

// 商品を Shopify に書き出す。
// SHOPIFY_SYNC_MODE: off（何もしない）/ dry-run（送る内容を記録するだけ。既定）/ live（送る）
export type SyncMode = 'off' | 'dry-run' | 'live'
export const syncMode = (): SyncMode => {
  const mode = process.env.SHOPIFY_SYNC_MODE
  if (!shopifyConfigured()) return 'off'
  return mode === 'live' || mode === 'off' ? mode : 'dry-run'
}

const QUEUE = 'shopify'
let runTimer: ReturnType<typeof setTimeout> | null = null

// 保存のあとに同期を予約する。2秒待ってからまとめて実行する（トランザクションの確定を待つため）
export async function queueProductSync(req: PayloadRequest, id: number): Promise<void> {
  await req.payload.jobs.queue({ task: 'syncProduct', input: { id }, queue: QUEUE, req })
  if (runTimer) clearTimeout(runTimer)
  const payload = req.payload
  runTimer = setTimeout(() => {
    runTimer = null
    payload.jobs.run({ queue: QUEUE }).catch((error) => payload.logger.error({ err: error }, 'Shopify の同期ジョブに失敗しました'))
  }, 2000)
}

export const syncProductTask: TaskConfig<{ input: { id: number }; output: object }> = {
  slug: 'syncProduct',
  label: '商品を Shopify に同期',
  inputSchema: [{ name: 'id', type: 'number', required: true }],
  retries: 2,
  handler: async ({ input, req }) => {
    await syncProduct(req.payload, input.id)
    return { output: {} }
  },
}

export async function fetchShopifyProduct(id: string): Promise<ShopifyProduct | null> {
  const data = await shopifyGraphQL<{ product: ShopifyProduct | null }>(`query($id: ID!) { product(id: $id) { ${PRODUCT_FIELDS} } }`, { id })
  return data.product
}

async function brandMap(payload: Payload): Promise<Map<number, Brand>> {
  const { docs } = await payload.find({ collection: 'brands', limit: 0, pagination: false, depth: 0, overrideAccess: true })
  return new Map(docs.map((b) => [b.id, b]))
}

const FIELD_LABELS: Record<string, string> = {
  title: '商品名',
  descriptionHtml: '説明文',
  productType: '品目',
  vendor: 'vendor',
  status: '状態',
  categoryId: 'カテゴリ',
  options: 'オプション',
  media: '写真',
}

const short = (value: unknown) => {
  const s = typeof value === 'string' ? value : JSON.stringify(value)
  return s && s.length > 60 ? `${s.slice(0, 60)}…` : (s ?? '（なし）')
}

// 差分を人が読める形にする（例: ・価格（1番目）: 8800.00 → 8900.00）
export function summarize(diffs: Difference[]): string {
  const lines: string[] = []
  for (const d of diffs) {
    if (d.field === 'tags') {
      const before = new Set(d.shopify as string[])
      const after = new Set(d.payload as string[])
      const added = [...after].filter((t) => !before.has(t))
      const removed = [...before].filter((t) => !after.has(t))
      lines.push(`・タグ: ${[...added.map((t) => `+${t}`), ...removed.map((t) => `−${t}`)].join(' ')}`)
    } else if (d.field === 'variants') {
      type V = { options: string[]; price: string; compareAtPrice: string | null }
      const before = d.shopify as V[]
      const after = d.payload as V[]
      if (before.length !== after.length) lines.push(`・バリエーションの数: ${before.length} → ${after.length}`)
      after.forEach((v, i) => {
        const b = before[i]
        if (!b) return
        const name = v.options.join(' / ') === 'Default Title' ? '' : `（${v.options.join(' / ')}）`
        if (b.price !== v.price) lines.push(`・価格${name}: ${b.price} → ${v.price}`)
        if (b.compareAtPrice !== v.compareAtPrice) lines.push(`・定価${name}: ${b.compareAtPrice ?? 'なし'} → ${v.compareAtPrice ?? 'なし'}`)
        if (b.options.join() !== v.options.join()) lines.push(`・オプションの値: ${b.options.join(' / ')} → ${v.options.join(' / ')}`)
      })
    } else if (d.field === 'media') {
      lines.push(`・写真: ${(d.shopify as string[]).length} 枚 → ${(d.payload as string[]).length} 枚（並び・入れ替えを含む）`)
    } else if (d.field.startsWith('metafield ')) {
      lines.push(`・${d.field.slice(10)}: ${short(d.shopify)} → ${short(d.payload)}`)
    } else {
      lines.push(`・${FIELD_LABELS[d.field] ?? d.field}: ${short(d.shopify)} → ${short(d.payload)}`)
    }
  }
  return lines.join('\n')
}

async function record(payload: Payload, id: number, shopify: Partial<NonNullable<Product['shopify']>>, extra: Partial<Product> = {}) {
  const doc = await payload.findByID({ collection: 'products', id, depth: 0, overrideAccess: true })
  await payload.update({
    collection: 'products',
    id,
    data: { ...extra, shopify: { ...doc.shopify, ...shopify } },
    overrideAccess: true,
    context: { fromSync: true },
  })
}

// Shopify の内容で Payload の商品を書き換える（取り込み・「Shopify の内容を取り込む」）
export async function importIntoDoc(payload: Payload, id: number | null, product: ShopifyProduct): Promise<number> {
  const { brandName, data } = docFromShopify(product)
  let brand: number | null = null
  if (brandName) {
    const found = await payload.find({ collection: 'brands', where: { name: { equals: brandName } }, limit: 1, depth: 0, overrideAccess: true })
    brand = found.docs[0]?.id ?? (await payload.create({ collection: 'brands', data: { name: brandName }, overrideAccess: true })).id
  }
  const doc = {
    ...data,
    brand,
    shopify: {
      ...data.shopify,
      fingerprint: fingerprint(fromShopify(product)),
      lastSyncedAt: new Date().toISOString(),
      syncStatus: 'synced' as const,
      syncMessage: null,
      resolve: null,
    },
  }
  if (id) {
    await payload.update({ collection: 'products', id, data: doc, overrideAccess: true, context: { fromShopify: true } })
    return id
  }
  const created = await payload.create({ collection: 'products', data: doc as never, overrideAccess: true, context: { fromShopify: true } })
  return created.id
}

let cachedLocation: string | null = null
async function locationId(): Promise<string> {
  if (cachedLocation) return cachedLocation
  const data = await shopifyGraphQL<{ locations: { nodes: { id: string; isActive: boolean }[] } }>(
    `{ locations(first: 10) { nodes { id isActive } } }`,
  )
  const location = data.locations.nodes.find((l) => l.isActive)
  if (!location) throw new Error('Shopify のロケーションが見つかりません')
  return (cachedLocation = location.id)
}

let cachedPublication: string | null = null
async function onlineStorePublicationId(): Promise<string> {
  if (cachedPublication) return cachedPublication
  const data = await shopifyGraphQL<{ publications: { nodes: { id: string; name: string }[] } }>(`{ publications(first: 20) { nodes { id name } } }`)
  const publication = data.publications.nodes.find((p) => p.name === 'Online Store' || p.name === 'オンラインストア')
  if (!publication) throw new Error('オンラインストアの販売チャネルが見つかりません')
  return (cachedPublication = publication.id)
}

// productSet の入力を作る。作成時だけ SKU・原価・初期在庫を入れる
async function productSetInput(doc: Product, desired: CanonicalProduct, creating: boolean) {
  const options = desired.options
  const location = creating ? await locationId() : null
  const images = doc.images ?? []
  return {
    title: desired.title,
    descriptionHtml: desired.descriptionHtml,
    productType: desired.productType,
    vendor: desired.vendor,
    status: desired.status,
    tags: desired.tags,
    ...(desired.categoryId ? { category: desired.categoryId } : {}),
    productOptions: options.map((o) => ({ name: o.name, values: o.values.map((name) => ({ name })) })),
    variants: desired.variants.map((v, i) => {
      const source = doc.variants?.[i]
      return {
        ...(v.id ? { id: v.id } : {}),
        optionValues: v.options.map((name, j) => ({ optionName: options[j]?.name ?? 'Title', name })),
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        ...(creating
          ? {
              inventoryItem: { tracked: true, ...(source?.sku ? { sku: source.sku } : {}), ...(source?.cost ? { cost: String(source.cost) } : {}) },
              inventoryQuantities: [{ locationId: location, name: 'available', quantity: source?.initialQuantity ?? 1 }],
            }
          : {}),
      }
    }),
    files: desired.media.map((m, i) => {
      const alt = images[i]?.alt ?? undefined
      return m.startsWith('new:') ? { originalSource: m.slice(4), contentType: 'IMAGE', ...(alt ? { alt } : {}) } : { id: m, ...(alt ? { alt } : {}) }
    }),
    metafields: Object.entries(desired.metafields).map(([key, { type, value }]) => {
      const [namespace, ...rest] = key.split('.')
      return { namespace, key: rest.join('.'), type, value }
    }),
  }
}

export async function syncProduct(payload: Payload, id: number): Promise<void> {
  const mode = syncMode()
  if (mode === 'off') return
  const doc = await payload.findByID({ collection: 'products', id, depth: 1, overrideAccess: true })
  const brands = await brandMap(payload)
  const desired = canonicalFromDoc(doc, brands)
  const productId = doc.shopify?.productId

  try {
    if (productId) {
      const product = await fetchShopifyProduct(productId)
      if (!product) throw new Error('Shopify に商品が見つかりません（削除された可能性があります）')
      const current = fromShopify(product)

      if (doc.shopify?.resolve === 'import') {
        await importIntoDoc(payload, id, product)
        return
      }
      // 前回の同期のあとに、Payload 以外（Shopify の管理画面・85crm など）で変わっていたら止める
      if (fingerprint(current) !== doc.shopify?.fingerprint && doc.shopify?.resolve !== 'overwrite') {
        const diffs = diffProducts(current, desired)
        await record(payload, id, {
          syncStatus: 'conflict',
          syncMessage: `前回の同期のあとに Shopify 側で変更されています。どちらを残すか選んでください。\n今の Shopify との違い:\n${summarize(diffs) || '（なし）'}`,
        })
        return
      }
      const diffs = diffProducts(current, desired)
      if (diffs.length === 0) {
        await record(payload, id, { syncStatus: 'synced', syncMessage: null, resolve: null, fingerprint: fingerprint(current), updatedAt: product.updatedAt })
        return
      }
      if (mode === 'dry-run') {
        await record(payload, id, { syncStatus: 'dry-run', syncMessage: `送る予定の変更:\n${summarize(diffs)}` })
        return
      }
      await push(payload, doc, desired, brands, productId)
      return
    }

    // 新しい商品
    if (mode === 'dry-run') {
      await record(payload, id, { syncStatus: 'dry-run', syncMessage: 'Shopify に新しく作る予定です（dry-run のため送っていません）。' })
      return
    }
    await push(payload, doc, desired, brands, null)
  } catch (error) {
    await record(payload, id, { syncStatus: 'error', syncMessage: error instanceof Error ? error.message : String(error) })
    throw error
  }
}

async function push(payload: Payload, doc: Product, desired: CanonicalProduct, brands: Map<number, Brand>, productId: string | null) {
  const creating = !productId
  const input = await productSetInput(doc, desired, creating)
  const result = await shopifyGraphQL<{
    productSet: { product: { id: string } | null; userErrors: { field: string[] | null; message: string }[] }
  }>(
    `mutation($input: ProductSetInput!, $identifier: ProductSetIdentifiers) {
      productSet(synchronous: true, input: $input, identifier: $identifier) { product { id } userErrors { field message } }
    }`,
    { input, identifier: productId ? { id: productId } : null },
  )
  assertNoUserErrors('productSet', result.productSet.userErrors)
  const newId = result.productSet.product!.id

  // 入力欄を空にしたメタフィールドを消す（productSet では消せないため）
  const { deleted } = metafieldsFromDoc(doc, brands)
  if (deleted.length) {
    const res = await shopifyGraphQL<{ metafieldsDelete: { userErrors: { field: string[] | null; message: string }[] } }>(
      `mutation($metafields: [MetafieldIdentifierInput!]!) { metafieldsDelete(metafields: $metafields) { userErrors { field message } } }`,
      {
        metafields: deleted.map((key) => {
          const [namespace, ...rest] = key.split('.')
          return { ownerId: newId, namespace, key: rest.join('.') }
        }),
      },
    )
    assertNoUserErrors('metafieldsDelete', res.metafieldsDelete.userErrors)
  }

  // 新しい商品はオンラインストアで販売できるようにする（表示するかは「状態」で決まる）
  if (creating) {
    const res = await shopifyGraphQL<{ publishablePublish: { userErrors: { field: string[] | null; message: string }[] } }>(
      `mutation($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { userErrors { field message } } }`,
      { id: newId, input: [{ publicationId: await onlineStorePublicationId() }] },
    )
    assertNoUserErrors('publishablePublish', res.publishablePublish.userErrors)
  }

  // 結果を読み直して、Shopify の ID（商品・バリアント・画像）と指紋を書き戻す
  const product = await fetchShopifyProduct(newId)
  if (!product) throw new Error('同期した商品を読み直せません')
  const images = (doc.images ?? []).map((image, i) => ({
    ...image,
    photo: typeof image.photo === 'object' && image.photo ? image.photo.id : image.photo,
    shopifyMediaId: product.media.nodes[i]?.id ?? image.shopifyMediaId,
    shopifyUrl: product.media.nodes[i]?.image?.url ?? product.media.nodes[i]?.preview?.image?.url ?? image.shopifyUrl,
  }))
  const variants = (doc.variants ?? []).map((variant, i) => ({
    ...variant,
    shopifyVariantId: product.variants.nodes[i]?.id ?? variant.shopifyVariantId,
    inventoryItemId: product.variants.nodes[i]?.inventoryItem.id ?? variant.inventoryItemId,
    inventoryQuantity: product.variants.nodes[i]?.inventoryQuantity ?? variant.inventoryQuantity,
  }))
  const synced = docFromShopify(product).data.shopify
  await record(
    payload,
    doc.id,
    {
      ...synced,
      fingerprint: fingerprint(fromShopify(product)),
      lastSyncedAt: new Date().toISOString(),
      syncStatus: 'synced',
      syncMessage: null,
      resolve: null,
    },
    { images, variants, ...(typeof doc.brand === 'object' && doc.brand ? { brand: doc.brand.id } : {}) },
  )
  // 85-store.com の New Arrivals を作り直す
  await revalidateSite(['shopify-products']).catch((error) => payload.logger.warn({ err: error }, 'サイトの再検証に失敗しました'))
}
