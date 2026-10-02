import type { Endpoint, Payload } from 'payload'
import { isAdmin } from '../access'
import { shopifyConfigured, shopifyGraphQL } from './client'
import { type ShopifyProduct, PRODUCT_FIELDS, diffProducts, fromShopify } from './canonical'
import { canonicalFromDoc } from './mapping'
import { importIntoDoc } from './sync'

// Shopify の商品をすべて Payload に取り込む（Shopify の ID で上書き。何度実行しても重複しない）
export async function importAllProducts(payload: Payload): Promise<{ created: number; updated: number }> {
  let after: string | null = null
  let created = 0
  let updated = 0
  do {
    const data: { products: { nodes: ShopifyProduct[]; pageInfo: { hasNextPage: boolean; endCursor: string } } } = await shopifyGraphQL(
      `query($after: String) { products(first: 25, after: $after) { pageInfo { hasNextPage endCursor } nodes { ${PRODUCT_FIELDS} } } }`,
      { after },
    )
    for (const product of data.products.nodes) {
      const found = await payload.find({
        collection: 'products',
        where: { 'shopify.productId': { equals: product.id } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      await importIntoDoc(payload, found.docs[0]?.id ?? null, product)
      if (found.docs[0]) updated++
      else created++
    }
    payload.logger.info(`Shopify から取り込み中: ${created + updated} 件`)
    after = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null
  } while (after)
  return { created, updated }
}

// 「Payload から作る Shopify のデータ」と今の Shopify を全件比べる（自動の同期を有効にする前の確認）
export async function diffAllProducts(payload: Payload) {
  const brands = new Map(
    (await payload.find({ collection: 'brands', limit: 0, pagination: false, depth: 0, overrideAccess: true })).docs.map((b) => [b.id, b]),
  )
  const report: { id: number; title: string; differences: ReturnType<typeof diffProducts> }[] = []
  let after: string | null = null
  let checked = 0
  do {
    const data: { products: { nodes: ShopifyProduct[]; pageInfo: { hasNextPage: boolean; endCursor: string } } } = await shopifyGraphQL(
      `query($after: String) { products(first: 25, after: $after) { pageInfo { hasNextPage endCursor } nodes { ${PRODUCT_FIELDS} } } }`,
      { after },
    )
    for (const product of data.products.nodes) {
      checked++
      const found = await payload.find({
        collection: 'products',
        where: { 'shopify.productId': { equals: product.id } },
        limit: 1,
        depth: 1,
        overrideAccess: true,
      })
      const doc = found.docs[0]
      if (!doc) {
        report.push({ id: 0, title: product.title, differences: [{ field: '（Payload に無い）', shopify: product.id, payload: null }] })
        continue
      }
      const differences = diffProducts(fromShopify(product), canonicalFromDoc(doc, brands))
      if (differences.length) report.push({ id: doc.id, title: doc.title, differences })
    }
    after = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null
  } while (after)
  return { checked, withDifferences: report.length, report }
}

// 管理者だけが呼べるエンドポイント（管理画面のボタンから使う）
let importRunning = false
export const shopifyEndpoints: Endpoint[] = [
  {
    path: '/shopify/import-products',
    method: 'post',
    handler: async (req) => {
      if (!isAdmin(req.user as never)) return Response.json({ error: '管理者だけが実行できます' }, { status: 403 })
      if (!shopifyConfigured()) return Response.json({ error: 'Shopify の設定がありません' }, { status: 400 })
      if (importRunning) return Response.json({ error: '取り込み中です' }, { status: 409 })
      importRunning = true
      // 時間がかかるので裏で実行し、すぐ返す（進み具合はログ）
      importAllProducts(req.payload)
        .then((result) => req.payload.logger.info(`Shopify から取り込み完了: 新規 ${result.created} 件・更新 ${result.updated} 件`))
        .catch((error) => req.payload.logger.error({ err: error }, 'Shopify からの取り込みに失敗しました'))
        .finally(() => (importRunning = false))
      return Response.json({ started: true })
    },
  },
  {
    path: '/shopify/diff-products',
    method: 'get',
    handler: async (req) => {
      if (!isAdmin(req.user as never)) return Response.json({ error: '管理者だけが実行できます' }, { status: 403 })
      if (!shopifyConfigured()) return Response.json({ error: 'Shopify の設定がありません' }, { status: 400 })
      return Response.json(await diffAllProducts(req.payload))
    },
  },
]
