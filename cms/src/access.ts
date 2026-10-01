import type { Access, FieldAccess } from 'payload'

// ロール: admin（ユーザー管理もできる）/ editor（記事・バナー・画像の作成と公開）
export type Role = 'admin' | 'editor'

type WithRole = { role?: Role | null } | null | undefined

export const isAdmin = (user: WithRole) => user?.role === 'admin'

export const loggedIn: Access = ({ req }) => Boolean(req.user)
export const adminOnly: Access = ({ req }) => isAdmin(req.user as WithRole)
export const adminOnlyField: FieldAccess = ({ req }) => isAdmin(req.user as WithRole)

// 自分のアカウントか、管理者
export const selfOrAdmin: Access = ({ req }) => {
  if (!req.user) return false
  if (isAdmin(req.user as WithRole)) return true
  return { id: { equals: req.user.id } }
}
