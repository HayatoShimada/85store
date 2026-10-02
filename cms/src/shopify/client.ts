// Shopify Admin GraphQL のクライアント
// 認証は Client Credentials（Payload 専用のアプリ。トークンは約24時間で切れるので取り直す）。
// ローカルでの開発・読み取りの確認だけ、固定のトークン SHOPIFY_ADMIN_TOKEN も使える。
export const SHOPIFY_API_VERSION = '2026-01'

const env = process.env
export const shopifyConfigured = () =>
  Boolean(env.SHOPIFY_STORE && ((env.SHOPIFY_CLIENT_ID && env.SHOPIFY_CLIENT_SECRET) || env.SHOPIFY_ADMIN_TOKEN))

let cached: { token: string; expiresAt: number } | null = null

async function accessToken(): Promise<string> {
  if (env.SHOPIFY_ADMIN_TOKEN && !env.SHOPIFY_CLIENT_ID) return env.SHOPIFY_ADMIN_TOKEN
  if (cached && Date.now() < cached.expiresAt - 5 * 60_000) return cached.token
  const res = await fetch(`https://${env.SHOPIFY_STORE}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.SHOPIFY_CLIENT_ID ?? '',
      client_secret: env.SHOPIFY_CLIENT_SECRET ?? '',
      grant_type: 'client_credentials',
    }),
  })
  if (!res.ok) throw new Error(`Shopify のトークンを取得できません: ${res.status}`)
  const data = (await res.json()) as { access_token: string; expires_in?: number }
  cached = { token: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 86_399) * 1000 }
  return cached.token
}

type GraphQLResponse<T> = {
  data?: T
  errors?: { message: string; extensions?: { code?: string } }[]
  extensions?: { cost?: { throttleStatus?: { currentlyAvailable: number; restoreRate: number } } }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function shopifyGraphQL<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`https://${env.SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'X-Shopify-Access-Token': await accessToken() },
      body: JSON.stringify({ query, variables }),
    })
    if (res.status === 401 && attempt === 0) {
      cached = null
      continue
    }
    if ((res.status === 429 || res.status >= 500) && attempt < 5) {
      await sleep(1000 * 2 ** attempt)
      continue
    }
    if (!res.ok) throw new Error(`Shopify API: ${res.status} ${await res.text()}`)
    const body = (await res.json()) as GraphQLResponse<T>
    if (body.errors?.some((e) => e.extensions?.code === 'THROTTLED') && attempt < 5) {
      await sleep(2000 * 2 ** attempt)
      continue
    }
    if (body.errors?.length) throw new Error(`Shopify API: ${body.errors.map((e) => e.message).join(' / ')}`)
    // 残りのコストが少なくなったら少し待つ（85crm も同じ API を使うため、使い切らない）
    const throttle = body.extensions?.cost?.throttleStatus
    if (throttle && throttle.currentlyAvailable < 200) await sleep((200 / throttle.restoreRate) * 1000)
    return body.data as T
  }
}

// mutation の userErrors をまとめて例外にする
export function assertNoUserErrors(label: string, errors: { field?: string[] | null; message: string }[] | undefined) {
  if (errors?.length) throw new Error(`${label}: ${errors.map((e) => `${e.field?.join('.') ?? ''} ${e.message}`).join(' / ')}`)
}
