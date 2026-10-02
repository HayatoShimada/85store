import crypto from 'node:crypto'

// Shopify の商品を「比べられる形」にそろえる。
// 取り込み直後の差分ゼロの確認、同期の前の衝突の検知（指紋）、dry-run の表示に使う。
// 在庫数・原価・SKU は Payload の担当外（作成時だけ）なので含めない。

// Payload が管理するメタフィールド（それ以外の Google ショッピング用などには触れない）
export const isManagedMetafield = (namespace: string, key: string) =>
  namespace === 'custom' || namespace === 'shopify' || (namespace === 'global' && key === 'description_tag')

export const PRODUCT_FIELDS = `
  id handle title descriptionHtml productType vendor status tags updatedAt
  category { id name }
  options { name optionValues { name } }
  variants(first: 100) { nodes { id price compareAtPrice sku inventoryQuantity selectedOptions { name value } inventoryItem { id } } }
  media(first: 50) { nodes { id alt mediaContentType preview { image { url } } ... on MediaImage { image { url width height } } } }
  metafields(first: 100) { nodes { namespace key type value } }
`

export type ShopifyProduct = {
  id: string
  handle: string
  title: string
  descriptionHtml: string
  productType: string
  vendor: string
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  tags: string[]
  updatedAt: string
  category: { id: string; name: string } | null
  options: { name: string; optionValues: { name: string }[] }[]
  variants: {
    nodes: {
      id: string
      price: string
      compareAtPrice: string | null
      sku: string | null
      inventoryQuantity: number | null
      selectedOptions: { name: string; value: string }[]
      inventoryItem: { id: string }
    }[]
  }
  media: {
    nodes: {
      id: string
      alt: string | null
      mediaContentType: string // IMAGE / VIDEO / EXTERNAL_VIDEO / MODEL_3D
      preview: { image: { url: string } | null } | null
      image?: { url: string; width: number; height: number }
    }[]
  }
  metafields: { nodes: { namespace: string; key: string; type: string; value: string }[] }
}

export type Metafield = { type: string; value: string }

export type CanonicalProduct = {
  title: string
  descriptionHtml: string
  productType: string
  vendor: string
  status: string
  tags: string[]
  categoryId: string | null
  options: { name: string; values: string[] }[]
  variants: { id: string | null; options: string[]; price: string; compareAtPrice: string | null }[]
  media: string[] // 既存は Shopify の media ID、新しい写真は "new:<URL>"
  metafields: Record<string, Metafield> // "namespace.key"
}

export const money = (value: string | number | null | undefined): string | null =>
  value === null || value === undefined || value === '' ? null : Number(value).toFixed(2)

// JSON・リストの型は、書式の違い（空白・キーの並び以外）を無視して比べる
export function normalizeMetafieldValue(type: string, value: string): string {
  if (type === 'json' || type.startsWith('list.')) {
    try {
      return JSON.stringify(JSON.parse(value))
    } catch {
      return value
    }
  }
  return value
}

export function fromShopify(product: ShopifyProduct): CanonicalProduct {
  const metafields: Record<string, Metafield> = {}
  for (const m of product.metafields.nodes) {
    if (isManagedMetafield(m.namespace, m.key)) {
      metafields[`${m.namespace}.${m.key}`] = { type: m.type, value: normalizeMetafieldValue(m.type, m.value) }
    }
  }
  return {
    title: product.title,
    descriptionHtml: product.descriptionHtml,
    productType: product.productType,
    vendor: product.vendor,
    status: product.status,
    tags: [...product.tags].sort(),
    categoryId: product.category?.id ?? null,
    options: product.options.map((o) => ({ name: o.name, values: o.optionValues.map((v) => v.name) })),
    variants: product.variants.nodes.map((v) => ({
      id: v.id,
      options: v.selectedOptions.map((o) => o.value),
      price: money(v.price)!,
      compareAtPrice: money(v.compareAtPrice),
    })),
    media: product.media.nodes.map((m) => m.id),
    metafields,
  }
}

const stable = (value: unknown): string =>
  JSON.stringify(value, (_key, v) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)))
      : v,
  )

export const fingerprint = (product: CanonicalProduct) => crypto.createHash('sha256').update(stable(product)).digest('hex')

export type Difference = { field: string; shopify: unknown; payload: unknown }

// a = 今の Shopify、b = Payload から作ったもの
export function diffProducts(a: CanonicalProduct, b: CanonicalProduct): Difference[] {
  const out: Difference[] = []
  for (const field of ['title', 'descriptionHtml', 'productType', 'vendor', 'status', 'categoryId'] as const) {
    if (a[field] !== b[field]) out.push({ field, shopify: a[field], payload: b[field] })
  }
  for (const field of ['tags', 'options', 'variants', 'media'] as const) {
    if (stable(a[field]) !== stable(b[field])) out.push({ field, shopify: a[field], payload: b[field] })
  }
  for (const key of new Set([...Object.keys(a.metafields), ...Object.keys(b.metafields)])) {
    if (stable(a.metafields[key]) !== stable(b.metafields[key])) {
      out.push({ field: `metafield ${key}`, shopify: a.metafields[key]?.value, payload: b.metafields[key]?.value })
    }
  }
  return out
}
