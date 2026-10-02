import type { Brand, Product, ProductPhoto } from '../payload-types'
import {
  type CanonicalProduct,
  type Metafield,
  type ShopifyProduct,
  isManagedMetafield,
  money,
  normalizeMetafieldValue,
} from './canonical'

// Payload の商品 ⇔ Shopify の商品の対応。
//
// 取り込んだ値（タグ・メタフィールド・説明文の HTML）はそのまま持ち、
// 入力欄（ブランド・状態ランク・採寸など）が「取り込んだ値から読み取った内容」と変わったときだけ置き換える。
// こうすると、取り込んだ直後は差分ゼロになり、書式（JSON の並びなど）も元のまま保たれる。

// 区分 → タグ（85crm と同じ決め事: 新品=NOT USED、委託=委託、古着=USED またはタグなし）
export const KIND_TAGS = { used: 'USED', new: 'NOT USED', consignment: '委託' } as const
export type Kind = keyof typeof KIND_TAGS
export const NEW_ARRIVAL_TAG = '新着'

export function kindFromTags(tags: string[]): Kind {
  const upper = tags.map((t) => t.toUpperCase())
  if (upper.includes('NOT USED')) return 'new'
  if (tags.includes('委託')) return 'consignment'
  return 'used'
}

type StructuredValue = string | string[] | { name: string; value: number }[] | null

// 入力欄と、それに対応するメタフィールド
type StructuredField = {
  key: string // namespace.key
  type: string // 新しく作るときの型
  read: (raw: string) => StructuredValue // メタフィールドの値 → 入力欄の値（読めなければ undefined 扱いで null）
  fromDoc: (doc: Partial<Product>, brands: Map<number, Brand>) => StructuredValue
  write: (value: Exclude<StructuredValue, null>) => string
}

const text = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null)
const list = (v: unknown) => (Array.isArray(v) && v.length ? v.map(String) : null)
const parseJson = (raw: string): unknown => {
  try {
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

export const STRUCTURED_FIELDS: StructuredField[] = [
  {
    key: 'custom.brand',
    type: 'single_line_text_field',
    read: (raw) => text(raw),
    fromDoc: (doc, brands) => {
      const id = typeof doc.brand === 'object' && doc.brand ? doc.brand.id : doc.brand
      return id ? (brands.get(id as number)?.name ?? null) : null
    },
    write: (v) => v as string,
  },
  { key: 'custom.condition', type: 'single_line_text_field', read: text, fromDoc: (d) => text(d.condition), write: (v) => v as string },
  { key: 'custom.era', type: 'single_line_text_field', read: text, fromDoc: (d) => text(d.era), write: (v) => v as string },
  {
    key: 'custom.style',
    type: 'json',
    read: (raw) => list(parseJson(raw)),
    fromDoc: (d) => list(d.style),
    write: (v) => JSON.stringify(v),
  },
  {
    key: 'custom.features',
    type: 'json',
    read: (raw) => list(parseJson(raw)),
    fromDoc: (d) => list(d.features),
    write: (v) => JSON.stringify(v),
  },
  {
    key: 'custom.measurements',
    type: 'json',
    read: (raw) => {
      const data = parseJson(raw)
      if (!data || typeof data !== 'object' || Array.isArray(data)) return null
      const rows = Object.entries(data as Record<string, unknown>).map(([name, value]) => ({ name, value: Number(value) }))
      return rows.length && rows.every((r) => Number.isFinite(r.value)) ? rows : null
    },
    fromDoc: (d) => {
      const rows = (d.measurements ?? []).filter((r) => r.name && typeof r.value === 'number')
      return rows.length ? rows.map((r) => ({ name: r.name, value: r.value as number })) : null
    },
    write: (v) => JSON.stringify(Object.fromEntries((v as { name: string; value: number }[]).map((r) => [r.name, r.value]))),
  },
  { key: 'custom.supplier', type: 'single_line_text_field', read: text, fromDoc: (d) => text(d.supplier), write: (v) => v as string },
  {
    key: 'custom.delivery_number',
    type: 'single_line_text_field',
    read: text,
    fromDoc: (d) => text(d.deliveryNumber),
    write: (v) => v as string,
  },
  {
    key: 'custom.delivery_date',
    type: 'single_line_text_field',
    read: text,
    fromDoc: (d) => text(d.deliveryDate),
    write: (v) => v as string,
  },
  {
    key: 'global.description_tag',
    type: 'single_line_text_field',
    read: text,
    fromDoc: (d) => text(d.seoDescription),
    write: (v) => v as string,
  },
]

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

type RawMetafields = Record<string, Metafield>

// 書き出すメタフィールド（取り込んだ値 + 入力欄で変わったもの）と、消すメタフィールド
export function metafieldsFromDoc(doc: Partial<Product>, brands: Map<number, Brand>) {
  const merged: RawMetafields = { ...((doc.shopify?.metafields as RawMetafields | null) ?? {}) }
  const deleted: string[] = []
  for (const field of STRUCTURED_FIELDS) {
    const raw = merged[field.key]
    const before = raw ? field.read(raw.value) : null
    const now = field.fromDoc(doc, brands)
    if (same(before, now)) continue
    if (now === null) {
      if (raw) {
        delete merged[field.key]
        deleted.push(field.key)
      }
    } else {
      const type = raw?.type ?? field.type
      merged[field.key] = { type, value: normalizeMetafieldValue(type, field.write(now)) }
    }
  }
  return { metafields: merged, deleted }
}

// 商品写真の URL（85pi の CMS。85crm の AI が説明文を作るときに読む。tailnet 内）
export const photoUrl = (photo: ProductPhoto) =>
  photo.filename ? `${(process.env.CMS_SERVER_URL || 'http://localhost:3001').replace(/\/$/, '')}/api/productPhotos/file/${encodeURIComponent(photo.filename)}` : ''

// Payload の商品 → 比べられる形
export function canonicalFromDoc(doc: Partial<Product>, brands: Map<number, Brand>): CanonicalProduct {
  const options = (doc.options ?? []).map((o) => ({ name: o.name, values: o.values ?? [] }))
  return {
    title: doc.title ?? '',
    descriptionHtml: doc.descriptionHtml ?? '',
    productType: doc.productType ?? '',
    vendor: doc.vendor ?? '',
    status: (doc.status ?? 'draft').toUpperCase(),
    tags: [...(doc.tags ?? [])].sort(),
    categoryId: doc.categoryId || null,
    options: options.length ? options : [{ name: 'Title', values: ['Default Title'] }],
    variants: (doc.variants ?? []).map((v) => ({
      id: v.shopifyVariantId || null,
      options: v.optionValues?.length ? v.optionValues : ['Default Title'],
      price: money(v.price)!,
      compareAtPrice: money(v.compareAtPrice),
    })),
    media: (doc.images ?? []).flatMap((image) => {
      if (image.shopifyMediaId) return [image.shopifyMediaId]
      if (image.photo) return [`new:${typeof image.photo === 'object' ? image.photo.id : image.photo}`]
      return []
    }),
    metafields: metafieldsFromDoc(doc, brands).metafields,
  }
}

// Shopify の商品 → Payload に取り込むデータ（ブランドは名前で返し、呼び出し側で ID にする）
export function docFromShopify(product: ShopifyProduct) {
  const metafields: RawMetafields = {}
  for (const m of product.metafields.nodes) {
    if (isManagedMetafield(m.namespace, m.key)) {
      metafields[`${m.namespace}.${m.key}`] = { type: m.type, value: normalizeMetafieldValue(m.type, m.value) }
    }
  }
  const read = (key: string) => {
    const field = STRUCTURED_FIELDS.find((f) => f.key === key)!
    return metafields[key] ? field.read(metafields[key].value) : null
  }
  const measurements = read('custom.measurements') as { name: string; value: number }[] | null
  return {
    brandName: read('custom.brand') as string | null,
    data: {
      kind: kindFromTags(product.tags),
      newArrival: product.tags.includes(NEW_ARRIVAL_TAG),
      autoTitle: false,
      title: product.title,
      status: product.status.toLowerCase() as 'active' | 'draft' | 'archived',
      descriptionHtml: product.descriptionHtml,
      seoDescription: read('global.description_tag') as string | null,
      productType: product.productType || null,
      vendor: product.vendor || null,
      categoryId: product.category?.id ?? null,
      categoryName: product.category?.name ?? null,
      tags: product.tags,
      condition: read('custom.condition') as Product['condition'],
      era: read('custom.era') as string | null,
      style: (read('custom.style') as string[] | null) ?? [],
      features: (read('custom.features') as string[] | null) ?? [],
      measurements: measurements ?? [],
      supplier: read('custom.supplier') as string | null,
      deliveryNumber: read('custom.delivery_number') as string | null,
      deliveryDate: read('custom.delivery_date') as string | null,
      options: product.options.map((o) => ({ name: o.name, values: o.optionValues.map((v) => v.name) })),
      variants: product.variants.nodes.map((v) => ({
        shopifyVariantId: v.id,
        inventoryItemId: v.inventoryItem.id,
        optionValues: v.selectedOptions.map((o) => o.value),
        price: Number(v.price),
        compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
        sku: v.sku || null,
        inventoryQuantity: v.inventoryQuantity,
      })),
      // 動画も順番どおりに残す（Payload では差し替えられないが、並べ替え・削除はできる）
      images: product.media.nodes.map((m) => ({
        shopifyMediaId: m.id,
        shopifyUrl: m.image?.url ?? m.preview?.image?.url ?? null,
        alt: m.alt || null,
      })),
      shopify: {
        productId: product.id,
        handle: product.handle,
        updatedAt: product.updatedAt,
        metafields,
      },
    },
  }
}
