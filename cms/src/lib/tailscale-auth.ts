import http from 'node:http'
import type { AuthStrategy } from 'payload'

// ログインは Tailscale の利用者 ID で行う（パスワードは使わない）。
// cms.85-store.com は CMS の端末の tailnet のアドレスを指しているので、tailnet の外からは届かない。
// 経路: tailscale serve（TCP の転送。PROXY プロトコルで接続元を渡す）→ Caddy（TLS の終端。X-Forwarded-For を接続元で上書き）→ Payload。
// Payload は 127.0.0.1 でだけ待ち受けるので、X-Forwarded-For は Caddy が付けたものしか届かない。
// その接続元の tailnet のアドレスを tailscaled に問い合わせ（whois）、ログイン名（メール）を得る。
// 開発中（NODE_ENV !== production）は CMS_DEV_LOGIN を代わりに使う。
//
// メンバーが1人もいないときは、CMS_BOOTSTRAP_ADMINS（カンマ区切り）のメールに限り、管理者として自動で登録する。
export const tailscaleStrategy: AuthStrategy = {
  name: 'tailscale',
  authenticate: async ({ headers, payload }) => {
    const login = await loginFrom(headers).catch((error) => {
      payload.logger.error({ err: error }, 'Tailscale の利用者を確認できません')
      return null
    })
    if (!login) return { user: null }

    const found = await payload.find({
      collection: 'users',
      where: { email: { equals: login } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    let user = found.docs[0]

    if (!user && bootstrapAdmins().includes(login)) {
      const { totalDocs } = await payload.count({ collection: 'users', overrideAccess: true })
      if (totalDocs === 0) {
        user = await payload.create({ collection: 'users', data: { email: login, role: 'admin' }, overrideAccess: true })
      }
    }
    return { user: user ? { ...user, collection: 'users' } : null }
  },
}

async function loginFrom(headers: Headers): Promise<string | null> {
  if (process.env.NODE_ENV !== 'production') return normalize(process.env.CMS_DEV_LOGIN)
  // Caddy が接続元で上書きした値（1つだけ）
  const ip = headers.get('x-forwarded-for')?.trim()
  if (!ip || ip.includes(',')) return null
  return normalize(await whois(ip))
}

const normalize = (value: string | null | undefined) => (value ? value.trim().toLowerCase() : null)

// tailscaled の LocalAPI の whois（同じ端末からの問い合わせを減らすため、1分だけ覚えておく）
const cache = new Map<string, { login: string | null; expiresAt: number }>()

async function whois(ip: string): Promise<string | null> {
  const hit = cache.get(ip)
  if (hit && hit.expiresAt > Date.now()) return hit.login
  const socketPath = process.env.TAILSCALE_SOCKET
  if (!socketPath) throw new Error('TAILSCALE_SOCKET がありません')
  const body = await new Promise<string>((resolve, reject) => {
    const req = http.request(
      { socketPath, path: `/localapi/v0/whois?addr=${encodeURIComponent(ip)}`, headers: { host: 'local-tailscaled.sock' }, timeout: 5000 },
      (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => (res.statusCode === 200 ? resolve(data) : res.statusCode === 404 ? resolve('') : reject(new Error(`whois: ${res.statusCode} ${data}`))))
      },
    )
    req.on('timeout', () => req.destroy(new Error('whois: タイムアウト')))
    req.on('error', reject)
    req.end()
  })
  // タグ付きの端末（サーバーなど）は人のアカウントではないので通さない
  const result = body ? (JSON.parse(body) as { Node?: { Tags?: string[] }; UserProfile?: { LoginName?: string } }) : null
  const login = result && !result.Node?.Tags?.length ? (result.UserProfile?.LoginName ?? null) : null
  cache.set(ip, { login, expiresAt: Date.now() + 60_000 })
  if (cache.size > 500) cache.clear()
  return login
}

const bootstrapAdmins = () =>
  (process.env.CMS_BOOTSTRAP_ADMINS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
