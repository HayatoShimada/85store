import type { AuthStrategy } from 'payload'

// tailscale serve は、tailnet 内のユーザーからのリクエストに Tailscale-User-Login（ログイン名＝メール）を付ける。
// Payload へは tailscale のサイドカーからしか届かない構成なので（ポートを外に出さない）、このヘッダーは偽装できない。
// 開発中（NODE_ENV !== production）は CMS_DEV_LOGIN を代わりに使う。
//
// メンバーが1人もいないときは、CMS_BOOTSTRAP_ADMINS（カンマ区切り）のメールに限り、管理者として自動で登録する。
export const tailscaleStrategy: AuthStrategy = {
  name: 'tailscale',
  authenticate: async ({ headers, payload }) => {
    const login = loginFrom(headers)
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

function loginFrom(headers: Headers): string | null {
  const value =
    headers.get('tailscale-user-login') ?? (process.env.NODE_ENV !== 'production' ? process.env.CMS_DEV_LOGIN : undefined)
  return value ? value.trim().toLowerCase() : null
}

const bootstrapAdmins = () =>
  (process.env.CMS_BOOTSTRAP_ADMINS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
