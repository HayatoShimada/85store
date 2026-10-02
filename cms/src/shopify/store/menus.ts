import type { CollectionSlug } from 'payload'
import { shopifyGraphQL } from '../client'
import { type Lookup, type ResourceDef, check, registerResource } from './engine'

// ストアのメニュー（ヘッダー・フッターなど）。項目は3階層まで

type ShopifyMenuItem = { id: string; title: string; type: string; url: string | null; resourceId: string | null; tags: string[]; items: ShopifyMenuItem[] }
type ShopifyMenu = { id: string; title: string; handle: string; isDefault: boolean; items: ShopifyMenuItem[] }

const ITEM = 'id title type url resourceId tags'
const MENU_FIELDS = `id title handle isDefault items { ${ITEM} items { ${ITEM} items { ${ITEM} } } }`

// 項目の種類 → リンク先のコレクション
export const RESOURCE_TYPES: Record<string, CollectionSlug> = {
  COLLECTION: 'shopifyCollections',
  PRODUCT: 'products',
  PAGE: 'storePages',
  BLOG: 'storeBlogs',
  ARTICLE: 'storeArticles',
}

type CanonicalItem = { title: string; type: string; resourceId: string | null; url: string | null; tags: string[]; items: CanonicalItem[] }

// URL は「URL」の項目だけ比べる（それ以外は Shopify がリンク先から作る）
const canonicalItems = (items: ShopifyMenuItem[]): CanonicalItem[] =>
  items.map((i) => ({
    title: i.title,
    type: i.type,
    resourceId: i.resourceId || null,
    url: i.type === 'HTTP' ? i.url || null : null,
    tags: [...i.tags].sort(),
    items: canonicalItems(i.items ?? []),
  }))

// Payload の項目の入れ子の欄の名前（同じ名前にすると DB の関連の名前がぶつかる）
export const CHILD_KEYS = ['items', 'subItems', 'subSubItems'] as const
const children = (item: DocItem | undefined, depth: number) => (item?.[CHILD_KEYS[depth]] as DocItem[] | null | undefined) ?? []

type DocItem = {
  title?: string
  type?: string
  resource?: { relationTo: CollectionSlug; value: unknown } | null
  resourceId?: string | null
  url?: string | null
  tags?: string[] | null
  itemId?: string | null
  items?: DocItem[] | null
  subItems?: DocItem[] | null
  subSubItems?: DocItem[] | null
}

async function desiredItems(items: DocItem[] | null | undefined, lookup: Lookup, depth = 1): Promise<CanonicalItem[]> {
  const out: CanonicalItem[] = []
  for (const i of items ?? []) {
    const type = i.type ?? 'HTTP'
    const resourceId = RESOURCE_TYPES[type] && i.resource ? await lookup.gid(i.resource.relationTo, i.resource.value) : (i.resourceId ?? null)
    out.push({
      title: i.title ?? '',
      type,
      resourceId: RESOURCE_TYPES[type] || type !== 'HTTP' ? resourceId || null : null,
      url: type === 'HTTP' ? i.url || null : null,
      tags: [...(i.tags ?? [])].sort(),
      items: depth < 3 ? await desiredItems(children(i, depth), lookup, depth + 1) : [],
    })
  }
  return out
}

async function docItems(items: ShopifyMenuItem[], lookup: Lookup, depth = 1): Promise<DocItem[]> {
  const out: DocItem[] = []
  for (const i of items) {
    const collection = RESOURCE_TYPES[i.type]
    const id = collection ? await lookup.id(collection, i.resourceId) : null
    out.push({
      title: i.title,
      type: i.type,
      // 関連が Payload に見つからないとき（ポリシーなど）は Shopify の ID をそのまま持つ
      resource: collection && id ? { relationTo: collection, value: id } : null,
      resourceId: collection && id ? null : i.resourceId || null,
      url: i.type === 'HTTP' ? i.url : null,
      tags: i.tags,
      itemId: i.id,
      ...(depth < 3 ? { [CHILD_KEYS[depth]]: await docItems(i.items ?? [], lookup, depth + 1) } : {}),
    })
  }
  return out
}

// 送る項目（既存の項目は ID を付けて更新し、付けなかった項目は Shopify が消す）
function inputItems(desired: CanonicalItem[], doc: DocItem[] | null | undefined, withIds: boolean, depth = 1): unknown[] {
  return desired.map((item, i) => {
    const source = doc?.[i]
    return {
      ...(withIds && source?.itemId ? { id: source.itemId } : {}),
      title: item.title,
      type: item.type,
      ...(item.resourceId ? { resourceId: item.resourceId } : {}),
      ...(item.url ? { url: item.url } : {}),
      tags: item.tags,
      items: inputItems(item.items, children(source, depth), withIds, depth + 1),
    }
  })
}

const def: ResourceDef<ShopifyMenu & { updatedAt?: null }> = {
  collection: 'storeMenus',
  label: 'メニュー',
  fieldLabels: { title: 'タイトル', handle: 'handle', items: '項目' },
  async fetchAll() {
    const data = await shopifyGraphQL<{ menus: { nodes: ShopifyMenu[] } }>(`{ menus(first: 50) { nodes { ${MENU_FIELDS} } } }`)
    return data.menus.nodes
  },
  async fetchOne(id) {
    const data = await shopifyGraphQL<{ menu: ShopifyMenu | null }>(`query($id: ID!) { menu(id: $id) { ${MENU_FIELDS} } }`, { id })
    return data.menu
  },
  canonical: (m) => ({ title: m.title, handle: m.handle, items: canonicalItems(m.items) }),
  desired: async (doc, lookup) => ({
    title: doc.title,
    handle: doc.handle || null,
    items: await desiredItems(doc.items as DocItem[], lookup),
  }),
  toDoc: async (m, lookup) => ({ title: m.title, handle: m.handle, isDefault: m.isDefault, items: await docItems(m.items, lookup) }),
  async create(desired, doc) {
    const res = await shopifyGraphQL<{ menuCreate: { menu: { id: string } | null; userErrors: { field: string[] | null; message: string }[] } }>(
      `mutation($title: String!, $handle: String!, $items: [MenuItemCreateInput!]!) { menuCreate(title: $title, handle: $handle, items: $items) { menu { id } userErrors { field message } } }`,
      {
        title: desired.title,
        handle: desired.handle || String(desired.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `menu-${Date.now()}`,
        items: inputItems(desired.items as CanonicalItem[], doc.items as DocItem[], false),
      },
    )
    check('menuCreate', res.menuCreate.userErrors)
    return res.menuCreate.menu!.id
  },
  async update(id, desired, current, doc) {
    const res = await shopifyGraphQL<{ menuUpdate: { userErrors: { field: string[] | null; message: string }[] } }>(
      `mutation($id: ID!, $title: String!, $handle: String, $items: [MenuItemUpdateInput!]!) { menuUpdate(id: $id, title: $title, handle: $handle, items: $items) { userErrors { field message } } }`,
      {
        id,
        title: desired.title,
        // 既定のメニュー（main-menu・footer など）は handle を変えられない
        handle: current.isDefault ? current.handle : (desired.handle ?? current.handle),
        items: inputItems(desired.items as CanonicalItem[], doc.items as DocItem[], true),
      },
    )
    check('menuUpdate', res.menuUpdate.userErrors)
  },
  async remove(id) {
    const res = await shopifyGraphQL<{ menuDelete: { userErrors: { field: string[] | null; message: string }[] } }>(
      `mutation($id: ID!) { menuDelete(id: $id) { userErrors { field message } } }`,
      { id },
    )
    check('menuDelete', res.menuDelete.userErrors)
  },
}
registerResource(def)
