import crypto from 'node:crypto'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  CollectionSlug,
  Endpoint,
  Field,
  Payload,
  PayloadRequest,
  TaskConfig,
} from 'payload'
import { isAdmin } from '../../access'
import { shopifyConfigured, shopifyGraphQL } from '../client'
import { applyBody } from './html'

// ストアのコレクション・ページ・ブログ・記事・メニューを、商品と同じ決め事で Shopify と同期する。
// - 正は Shopify。画面を開いたときと10分ごとに取り込む（Payload で未送信の変更があるものは取り込まない）
// - 保存すると Shopify に送る。前回の同期のあとに Shopify 側で変わっていたら止めて、どちらを残すか選んでもらう
// - SHOPIFY_STORE_SYNC_MODE: off / dry-run（送る内容を記録するだけ。既定）/ live（送る）

export type StoreSyncMode = 'off' | 'dry-run' | 'live'
export const storeSyncMode = (): StoreSyncMode => {
  const mode = process.env.SHOPIFY_STORE_SYNC_MODE
  if (!shopifyConfigured()) return 'off'
  return mode === 'live' || mode === 'off' ? mode : 'dry-run'
}

export type SyncState = {
  id?: string | null
  syncStatus?: 'synced' | 'pending' | 'dry-run' | 'conflict' | 'error' | null
  syncMessage?: string | null
  resolve?: 'overwrite' | 'import' | null
  updatedAt?: string | null
  lastSyncedAt?: string | null
  fingerprint?: string | null
}
export type StoreDoc = { id: number; shopify?: SyncState | null; [key: string]: unknown }
type Canonical = Record<string, unknown>

// Payload の ID ⇔ Shopify の ID（関連の変換。1回の処理の中だけキャッシュする）
const ID_PATHS: Partial<Record<CollectionSlug, string>> = { products: 'shopify.productId' }
const idPath = (collection: CollectionSlug) => ID_PATHS[collection] ?? 'shopify.id'

export class Lookup {
  private toGid = new Map<string, string | null>()
  private toId = new Map<string, number | null>()
  constructor(readonly payload: Payload) {}

  async gid(collection: CollectionSlug, value: unknown): Promise<string | null> {
    if (value && typeof value === 'object') {
      const shopify = (value as { shopify?: { id?: string; productId?: string } }).shopify
      const found = collection === 'products' ? shopify?.productId : shopify?.id
      if (found) return found
      value = (value as { id: unknown }).id
    }
    if (typeof value !== 'number') return null
    const key = `${collection}:${value}`
    if (!this.toGid.has(key)) {
      const doc = (await this.payload.findByID({ collection, id: value, depth: 0, overrideAccess: true, disableErrors: true })) as StoreDoc | null
      const shopify = doc?.shopify as { id?: string; productId?: string } | undefined
      this.toGid.set(key, (collection === 'products' ? shopify?.productId : shopify?.id) ?? null)
    }
    return this.toGid.get(key) ?? null
  }

  async id(collection: CollectionSlug, gid: string | null | undefined): Promise<number | null> {
    if (!gid) return null
    const key = `${collection}:${gid}`
    if (!this.toId.has(key)) {
      const found = await this.payload.find({ collection, where: { [idPath(collection)]: { equals: gid } }, limit: 1, depth: 0, overrideAccess: true })
      this.toId.set(key, (found.docs[0]?.id as number | undefined) ?? null)
    }
    return this.toId.get(key) ?? null
  }
}

export type ResourceDef<S extends { id: string; updatedAt?: string | null }> = {
  collection: CollectionSlug
  label: string
  // 本文（HTML）の欄。見たままで編集したら HTML を作り直す
  bodies?: string[]
  // 送ったあとに Shopify の内容を書き戻すとき、Payload の値を残す欄（見たままの本文など）
  keepOnWriteBack?: string[]
  fieldLabels: Record<string, string>
  fetchAll(): Promise<S[]>
  fetchOne(id: string): Promise<S | null>
  canonical(s: S): Canonical
  desired(doc: StoreDoc, lookup: Lookup): Promise<Canonical>
  // Shopify → Payload に入れるデータ（existing は今の Payload の内容。本文の編集のしかたを引き継ぐ）
  toDoc(s: S, lookup: Lookup, existing?: StoreDoc): Promise<Record<string, unknown>>
  create(desired: Canonical, doc: StoreDoc): Promise<string>
  update(id: string, desired: Canonical, current: S, doc: StoreDoc): Promise<void>
  remove(id: string): Promise<void>
}

// 同期の順番（関連する先を先に取り込む）
const registry: ResourceDef<{ id: string; updatedAt?: string | null }>[] = []
export function registerResource<S extends { id: string; updatedAt?: string | null }>(def: ResourceDef<S>) {
  registry.push(def as unknown as ResourceDef<{ id: string; updatedAt?: string | null }>)
}
const defOf = (collection: string) => {
  const def = registry.find((d) => d.collection === collection)
  if (!def) throw new Error(`同期の定義がありません: ${collection}`)
  return def
}

// ---------------------------------------------------------------------------
// 比べる
// ---------------------------------------------------------------------------

const stable = (value: unknown): string =>
  JSON.stringify(value, (_key, v) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)))
      : v,
  )
export const fingerprint = (c: Canonical) => crypto.createHash('sha256').update(stable(c)).digest('hex')

export function diff(current: Canonical, desired: Canonical): string[] {
  return Object.keys({ ...current, ...desired }).filter((key) => stable(current[key] ?? null) !== stable(desired[key] ?? null))
}

const short = (value: unknown) => {
  const s = value === null || value === undefined || value === '' ? '（なし）' : typeof value === 'string' ? value : JSON.stringify(value)
  return s.length > 60 ? `${s.slice(0, 60)}…` : s
}

function summarize(def: ResourceDef<{ id: string }>, current: Canonical, desired: Canonical, keys: string[]) {
  return keys.map((key) => `・${def.fieldLabels[key] ?? key}: ${short(current[key])} → ${short(desired[key])}`).join('\n')
}

// ---------------------------------------------------------------------------
// 記録・取り込み
// ---------------------------------------------------------------------------

async function record(payload: Payload, collection: CollectionSlug, id: number, shopify: SyncState, extra: Record<string, unknown> = {}) {
  const doc = (await payload.findByID({ collection, id, depth: 0, overrideAccess: true })) as unknown as StoreDoc
  await payload.update({
    collection,
    id,
    data: { ...extra, shopify: { ...doc.shopify, ...shopify } } as never,
    overrideAccess: true,
    context: { fromSync: true },
  })
}

const syncedState = (def: ResourceDef<{ id: string; updatedAt?: string | null }>, s: { id: string; updatedAt?: string | null }): SyncState => ({
  id: s.id,
  updatedAt: s.updatedAt ?? null,
  fingerprint: fingerprint(def.canonical(s)),
  lastSyncedAt: new Date().toISOString(),
  syncStatus: 'synced',
  syncMessage: null,
  resolve: null,
})

export async function importInto(
  payload: Payload,
  def: ResourceDef<{ id: string; updatedAt?: string | null }>,
  existing: StoreDoc | null,
  s: { id: string; updatedAt?: string | null },
  lookup = new Lookup(payload),
): Promise<number> {
  const data = { ...(await def.toDoc(s, lookup, existing ?? undefined)), shopify: syncedState(def, s) }
  if (existing) {
    await payload.update({ collection: def.collection, id: existing.id, data: data as never, overrideAccess: true, context: { fromShopify: true } })
    return existing.id
  }
  const created = await payload.create({ collection: def.collection, data: data as never, overrideAccess: true, context: { fromShopify: true } })
  return created.id as number
}

async function findByShopifyId(payload: Payload, collection: CollectionSlug, gid: string): Promise<StoreDoc | null> {
  const found = await payload.find({ collection, where: { 'shopify.id': { equals: gid } }, limit: 1, depth: 0, overrideAccess: true })
  return (found.docs[0] as unknown as StoreDoc | undefined) ?? null
}

const hasUnsyncedChanges = (doc: StoreDoc) => ['pending', 'dry-run', 'conflict', 'error'].includes(doc.shopify?.syncStatus ?? '')

// ---------------------------------------------------------------------------
// Payload → Shopify
// ---------------------------------------------------------------------------

export async function syncResource(payload: Payload, collection: string, id: number): Promise<void> {
  const mode = storeSyncMode()
  if (mode === 'off') return
  const def = defOf(collection)
  const doc = (await payload.findByID({ collection: def.collection, id, depth: 1, overrideAccess: true, disableErrors: true })) as StoreDoc | null
  if (!doc) return
  const lookup = new Lookup(payload)
  const desired = await def.desired(doc, lookup)
  const shopifyId = doc.shopify?.id
  try {
    let target: string
    if (shopifyId) {
      const current = await def.fetchOne(shopifyId)
      if (!current) throw new Error('Shopify に見つかりません（削除された可能性があります）')
      if (doc.shopify?.resolve === 'import') {
        await importInto(payload, def, doc, current, lookup)
        return
      }
      const now = def.canonical(current)
      if (fingerprint(now) !== doc.shopify?.fingerprint && doc.shopify?.resolve !== 'overwrite') {
        await record(payload, def.collection, id, {
          syncStatus: 'conflict',
          syncMessage: `編集している間に、Shopify 側でも変更されました。どちらを残すか選んでください。\n今の Shopify との違い:\n${summarize(def, now, desired, diff(now, desired)) || '（なし）'}`,
        })
        return
      }
      const keys = diff(now, desired)
      if (keys.length === 0) {
        await record(payload, def.collection, id, syncedState(def, current))
        return
      }
      if (mode === 'dry-run') {
        await record(payload, def.collection, id, { syncStatus: 'dry-run', syncMessage: `送る予定の変更:\n${summarize(def, now, desired, keys)}` })
        return
      }
      await def.update(shopifyId, desired, current, doc)
      target = shopifyId
    } else {
      if (mode === 'dry-run') {
        await record(payload, def.collection, id, { syncStatus: 'dry-run', syncMessage: 'Shopify に新しく作る予定です（dry-run のため送っていません）。' })
        return
      }
      target = await def.create(desired, doc)
    }

    // 読み直して書き戻す（Shopify が整えた内容・新しい ID）。見たままの本文などは Payload の値を残す
    const reread = await def.fetchOne(target)
    if (!reread) throw new Error('送った内容を読み直せません')
    const data = await def.toDoc(reread, lookup, doc)
    for (const key of def.keepOnWriteBack ?? []) delete data[key]
    await record(payload, def.collection, id, syncedState(def, reread), data)
  } catch (error) {
    await record(payload, def.collection, id, { syncStatus: 'error', syncMessage: error instanceof Error ? error.message : String(error) })
    throw error
  }
}

// ---------------------------------------------------------------------------
// Shopify → Payload
// ---------------------------------------------------------------------------

// 画面を開いたときに取り込む
export async function refreshResource(payload: Payload, collection: string, id: number): Promise<{ changed: boolean; message?: string }> {
  const def = defOf(collection)
  const doc = (await payload.findByID({ collection: def.collection, id, depth: 0, overrideAccess: true })) as unknown as StoreDoc
  if (!doc.shopify?.id) return { changed: false }
  if (hasUnsyncedChanges(doc)) return { changed: false, message: 'Shopify にまだ送っていない変更があるため、取り込みませんでした。' }
  const s = await def.fetchOne(doc.shopify.id)
  if (!s) {
    await record(payload, def.collection, id, { syncStatus: 'error', syncMessage: 'Shopify で削除されています。不要なら削除してください。' })
    return { changed: true }
  }
  if (fingerprint(def.canonical(s)) === doc.shopify.fingerprint) return { changed: false }
  await importInto(payload, def, doc, s)
  return { changed: true }
}

// すべて取り込む（初回）。何度実行しても重複しない
export async function importAllStore(payload: Payload) {
  const result: Record<string, number> = {}
  for (const def of registry) {
    const lookup = new Lookup(payload)
    const items = await def.fetchAll()
    for (const s of items) await importInto(payload, def, await findByShopifyId(payload, def.collection, s.id), s, lookup)
    result[def.collection] = items.length
    payload.logger.info(`Shopify から取り込み: ${def.label} ${items.length} 件`)
  }
  return result
}

// Shopify で変わったもの・新しく作られたもの・削除されたものを反映する（10分ごと）
export async function refreshAllStore(payload: Payload) {
  for (const def of registry) {
    const lookup = new Lookup(payload)
    const items = await def.fetchAll()
    let imported = 0
    for (const s of items) {
      const doc = await findByShopifyId(payload, def.collection, s.id)
      if (doc && (hasUnsyncedChanges(doc) || fingerprint(def.canonical(s)) === doc.shopify?.fingerprint)) continue
      await importInto(payload, def, doc, s, lookup)
      imported++
    }
    const ids = new Set(items.map((s) => s.id))
    const { docs } = await payload.find({ collection: def.collection, where: { 'shopify.syncStatus': { equals: 'synced' } }, limit: 0, pagination: false, depth: 0, overrideAccess: true })
    for (const doc of docs as unknown as StoreDoc[]) {
      if (doc.shopify?.id && !ids.has(doc.shopify.id)) {
        await record(payload, def.collection, doc.id, { syncStatus: 'error', syncMessage: 'Shopify で削除されています。不要なら削除してください。' })
      }
    }
    if (imported) payload.logger.info(`Shopify から取り込み: ${def.label} ${imported} 件`)
  }
}

// 「Payload から作る Shopify のデータ」と今の Shopify を全件比べる（live にする前の確認）
export async function diffAllStore(payload: Payload) {
  const report: { collection: string; id: number | null; title: string; differences: string }[] = []
  let checked = 0
  for (const def of registry) {
    const lookup = new Lookup(payload)
    for (const s of await def.fetchAll()) {
      checked++
      const found = await findByShopifyId(payload, def.collection, s.id)
      const doc = found && ((await payload.findByID({ collection: def.collection, id: found.id, depth: 1, overrideAccess: true })) as unknown as StoreDoc)
      const title = String((s as { title?: string }).title ?? s.id)
      if (!doc) {
        report.push({ collection: def.collection, id: null, title, differences: '（Payload に無い）' })
        continue
      }
      const current = def.canonical(s)
      const desired = await def.desired(doc, lookup)
      const keys = diff(current, desired)
      if (keys.length) report.push({ collection: def.collection, id: doc.id, title, differences: summarize(def, current, desired, keys) })
    }
  }
  return { checked, withDifferences: report.length, report }
}

// ---------------------------------------------------------------------------
// ジョブ・フック・エンドポイント・欄
// ---------------------------------------------------------------------------

const QUEUE = 'shopify'
let runTimer: ReturnType<typeof setTimeout> | null = null
async function queue(req: PayloadRequest, task: 'syncStoreResource' | 'deleteStoreResource', input: Record<string, unknown>) {
  await req.payload.jobs.queue({ task, input: input as never, queue: QUEUE, req })
  if (runTimer) clearTimeout(runTimer)
  const payload = req.payload
  runTimer = setTimeout(() => {
    runTimer = null
    payload.jobs.run({ queue: QUEUE }).catch((error) => payload.logger.error({ err: error }, 'Shopify の同期ジョブに失敗しました'))
  }, 2000)
}

export const syncStoreResourceTask: TaskConfig<{ input: { collection: string; id: number }; output: object }> = {
  slug: 'syncStoreResource',
  label: 'ストアの内容を Shopify に同期',
  inputSchema: [
    { name: 'collection', type: 'text', required: true },
    { name: 'id', type: 'number', required: true },
  ],
  retries: 2,
  handler: async ({ input, req }) => {
    await syncResource(req.payload, input.collection, input.id)
    return { output: {} }
  },
}

export const deleteStoreResourceTask: TaskConfig<{ input: { collection: string; shopifyId: string }; output: object }> = {
  slug: 'deleteStoreResource',
  label: 'ストアの内容を Shopify から削除',
  inputSchema: [
    { name: 'collection', type: 'text', required: true },
    { name: 'shopifyId', type: 'text', required: true },
  ],
  retries: 2,
  handler: async ({ input, req }) => {
    if (storeSyncMode() !== 'live') {
      req.payload.logger.info(`dry-run のため Shopify から削除しませんでした: ${input.shopifyId}`)
      return { output: {} }
    }
    await defOf(input.collection).remove(input.shopifyId)
    return { output: {} }
  },
}

export const refreshStoreTask: TaskConfig<{ input: object; output: object }> = {
  slug: 'refreshStore',
  label: 'Shopify で変わったストアの内容を取り込む',
  inputSchema: [],
  retries: 1,
  // 10分ごと（商品の取り込みと5分ずらす）
  schedule: [{ cron: '0 5-59/10 * * * *', queue: QUEUE }],
  handler: async ({ req }) => {
    await refreshAllStore(req.payload)
    return { output: {} }
  },
}

// コレクションに付けるフック
export function storeHooks(collection: CollectionSlug, bodies: string[] = []) {
  const beforeChange: CollectionBeforeChangeHook = ({ data, originalDoc, context, req }) => {
    if (context.fromShopify || context.fromSync) return data
    for (const name of bodies) applyBody(req.payload, collection, name, data, originalDoc)
    if (storeSyncMode() !== 'off') data.shopify = { ...(originalDoc?.shopify ?? {}), ...(data.shopify ?? {}), syncStatus: 'pending' }
    return data
  }
  const afterChange: CollectionAfterChangeHook = async ({ doc, context, req }) => {
    if (context.fromShopify || context.fromSync || storeSyncMode() === 'off') return doc
    await queue(req, 'syncStoreResource', { collection, id: doc.id })
    return doc
  }
  // 削除は管理者だけ（access）。Shopify からも消す
  const afterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
    const shopifyId = (doc as StoreDoc).shopify?.id
    if (shopifyId && storeSyncMode() !== 'off') await queue(req, 'deleteStoreResource', { collection, shopifyId })
  }
  return { beforeChange: [beforeChange], afterChange: [afterChange], afterDelete: [afterDelete] }
}

// /api/<collection>/:id/refresh（画面を開いたときに呼ぶ）
export const storeRefreshEndpoint = (collection: CollectionSlug): Endpoint => ({
  path: '/:id/refresh',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'ログインしてください' }, { status: 401 })
    if (!shopifyConfigured()) return Response.json({ changed: false })
    try {
      return Response.json(await refreshResource(req.payload, collection, Number(req.routeParams?.id)))
    } catch (error) {
      return Response.json({ changed: false, message: error instanceof Error ? error.message : String(error) }, { status: 502 })
    }
  },
})

// 管理者だけ: 全件の取り込み・差分の確認
let importRunning = false
export const storeEndpoints: Endpoint[] = [
  {
    path: '/shopify/import-store',
    method: 'post',
    handler: async (req) => {
      if (!isAdmin(req.user as never)) return Response.json({ error: '管理者だけが実行できます' }, { status: 403 })
      if (!shopifyConfigured()) return Response.json({ error: 'Shopify の設定がありません' }, { status: 400 })
      if (importRunning) return Response.json({ error: '取り込み中です' }, { status: 409 })
      importRunning = true
      try {
        return Response.json(await importAllStore(req.payload))
      } finally {
        importRunning = false
      }
    },
  },
  {
    path: '/shopify/diff-store',
    method: 'get',
    handler: async (req) => {
      if (!isAdmin(req.user as never)) return Response.json({ error: '管理者だけが実行できます' }, { status: 403 })
      if (!shopifyConfigured()) return Response.json({ error: 'Shopify の設定がありません' }, { status: 400 })
      return Response.json(await diffAllStore(req.payload))
    },
  },
]

// サイドバーの「Shopify」の欄
export const syncSidebar = (): Field => ({
  name: 'shopify',
  label: 'Shopify',
  type: 'group',
  admin: { position: 'sidebar' },
  fields: [
    { name: 'refresher', type: 'ui', admin: { components: { Field: '/components/ShopifyRefresher#ShopifyRefresher' } } },
    {
      name: 'syncStatus',
      label: '同期',
      type: 'select',
      options: [
        { label: '同期済み', value: 'synced' },
        { label: '待ち', value: 'pending' },
        { label: '確認のみ（dry-run）', value: 'dry-run' },
        { label: 'Shopify 側で変更あり', value: 'conflict' },
        { label: 'エラー', value: 'error' },
      ],
      admin: { readOnly: true },
    },
    { name: 'syncMessage', label: '内容', type: 'textarea', admin: { readOnly: true } },
    {
      name: 'resolve',
      label: 'Shopify 側で変更があったとき',
      type: 'select',
      options: [
        { label: 'Payload の内容で上書きする', value: 'overwrite' },
        { label: 'Shopify の内容を取り込む', value: 'import' },
      ],
      admin: { condition: (data) => data?.shopify?.syncStatus === 'conflict', description: '選んで保存すると実行します。' },
    },
    { name: 'id', label: 'Shopify の ID', type: 'text', index: true, admin: { readOnly: true } },
    { name: 'updatedAt', label: 'Shopify の更新日時', type: 'text', admin: { readOnly: true } },
    { name: 'lastSyncedAt', label: '前回の同期', type: 'date', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'fingerprint', type: 'text', admin: { hidden: true } },
  ],
})

// handle（URL の末尾）。Shopify にあるものは空にできない（空なら作成時に Shopify が決める）
export const handleField = (description = 'URL の末尾です。変えると、古い URL から新しい URL へ自動で転送されます。'): Field => ({
  name: 'handle',
  label: 'handle（URL）',
  type: 'text',
  admin: { description },
  validate: (value: unknown, { data }: { data: Partial<StoreDoc> }) =>
    data?.shopify?.id && !(typeof value === 'string' && value.trim()) ? 'Shopify にあるものは空にできません' : true,
})

// GraphQL の mutation の userErrors を例外にする
export function check(label: string, errors: { field?: string[] | null; message: string }[] | undefined) {
  if (errors?.length) throw new Error(`${label}: ${errors.map((e) => `${e.field?.join('.') ?? ''} ${e.message}`).join(' / ')}`)
}

// SEO（global.title_tag / description_tag）のメタフィールド
export const SEO_QUERY = `titleTag: metafield(namespace: "global", key: "title_tag") { value type } descriptionTag: metafield(namespace: "global", key: "description_tag") { value type }`
export type SeoMeta = { titleTag?: { value: string; type: string } | null; descriptionTag?: { value: string; type: string } | null }

// SEO の入力（変わったものだけ）と、空にして消すもの
export function seoMetafields(current: SeoMeta | null, desired: { seoTitle?: unknown; seoDescription?: unknown }) {
  const set: { namespace: string; key: string; type: string; value: string }[] = []
  const remove: { namespace: string; key: string }[] = []
  for (const [key, value, now] of [
    ['title_tag', desired.seoTitle, current?.titleTag],
    ['description_tag', desired.seoDescription, current?.descriptionTag],
  ] as const) {
    const text = typeof value === 'string' && value.trim() ? value : null
    if (text === (now?.value || null)) continue
    if (text) set.push({ namespace: 'global', key, type: now?.type ?? 'single_line_text_field', value: text })
    else if (now) remove.push({ namespace: 'global', key })
  }
  return { set, remove }
}

export async function deleteMetafields(ownerId: string, remove: { namespace: string; key: string }[]) {
  if (!remove.length) return
  const res = await shopifyGraphQL<{ metafieldsDelete: { userErrors: { field: string[] | null; message: string }[] } }>(
    `mutation($metafields: [MetafieldIdentifierInput!]!) { metafieldsDelete(metafields: $metafields) { userErrors { field message } } }`,
    { metafields: remove.map((m) => ({ ownerId, ...m })) },
  )
  check('metafieldsDelete', res.metafieldsDelete.userErrors)
}

export const text = (value: unknown) => (typeof value === 'string' && value.trim() ? value : null)
