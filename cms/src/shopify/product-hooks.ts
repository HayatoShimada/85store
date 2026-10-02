import type { CollectionAfterChangeHook, CollectionBeforeChangeHook } from 'payload'
import { descriptionToHTML } from '../lib/description'
import type { Brand, Product } from '../payload-types'
import { KIND_TAGS, type Kind, NEW_ARRIVAL_TAG } from './mapping'
import { queueProductSync, syncMode } from './sync'

// context.fromShopify（取り込み）・context.fromSync（同期の結果の書き戻し）のときは何もしない

const KIND_TAG_VALUES = Object.values(KIND_TAGS).map((t) => t.toUpperCase())

const changed = <K extends keyof Product>(data: Partial<Product>, original: Partial<Product> | undefined, key: K) =>
  !original || JSON.stringify(data[key] ?? null) !== JSON.stringify(original[key] ?? null)

function titleFrom(kind: Kind, brand: Brand | null, name: string, suffix?: string | null): string {
  const label = brand ? brand.titleLabel || brand.name : ''
  const head = label ? `[${label}] ${name}` : name
  if (kind === 'used') return `${head} [USED]`
  return suffix ? `${head} [${suffix}]` : head
}

export const productBeforeChange: CollectionBeforeChangeHook<Product> = async ({ data, originalDoc, context, req }) => {
  if (context.fromShopify || context.fromSync) return data
  const original = originalDoc as Partial<Product> | undefined
  let tags = [...(data.tags ?? original?.tags ?? [])]

  // 区分を変えたら、区分のタグを付け替える（古着は USED）
  if (data.kind && changed(data, original, 'kind')) {
    tags = tags.filter((t) => !KIND_TAG_VALUES.includes(t.toUpperCase()))
    tags.push(KIND_TAGS[data.kind as Kind])
  }
  // 新着のチェックに合わせて「新着」タグを付け外し
  if (changed(data, original, 'newArrival') && data.newArrival !== undefined) {
    tags = tags.filter((t) => t !== NEW_ARRIVAL_TAG)
    if (data.newArrival) tags.push(NEW_ARRIVAL_TAG)
  }
  data.tags = tags

  // 商品名を作る（ブランド・品名・区分・末尾を変えたとき）
  const titleInputs = ['autoTitle', 'brand', 'name', 'kind', 'titleSuffix'] as const
  if (data.autoTitle && data.name && titleInputs.some((key) => changed(data, original, key))) {
    const brandId = typeof data.brand === 'object' && data.brand ? data.brand.id : data.brand
    const brand = brandId ? await req.payload.findByID({ collection: 'brands', id: brandId as number, depth: 0, req }) : null
    data.title = titleFrom((data.kind ?? 'used') as Kind, brand, data.name, data.titleSuffix)
  }

  // 説明文を編集したら、Shopify に送る HTML を作り直す。
  // 内容が変わっていないとき（エディタが JSON の形だけ整えた場合など）は、取り込んだ HTML をそのまま残す
  if (data.description && changed(data, original, 'description') && !context.keepDescriptionHtml) {
    const html = descriptionToHTML(data.description)
    if (html !== descriptionToHTML(original?.description)) data.descriptionHtml = html
  }

  if (syncMode() !== 'off') data.shopify = { ...(data.shopify ?? original?.shopify), syncStatus: 'pending' }
  return data
}

export const productAfterChange: CollectionAfterChangeHook<Product> = async ({ doc, context, req }) => {
  if (context.fromShopify || context.fromSync || syncMode() === 'off') return doc
  await queueProductSync(req, doc.id)
  return doc
}
