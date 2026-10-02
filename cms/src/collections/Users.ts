import type { CollectionConfig } from 'payload'
import { adminOnly, adminOnlyField, selfOrAdmin } from '../access'
import { tailscaleStrategy } from '../lib/tailscale-auth'

// ログインは Tailscale（tailscale serve が付ける Tailscale-User-Login）で行う。パスワードは使わない。
// ここに登録されたメールアドレスの人だけが管理画面に入れる。
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'メンバー', plural: 'メンバー' },
  admin: { group: '設定',
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role'],
    description: 'Tailscale のアカウントのメールアドレスを登録すると、その人が管理画面に入れるようになります。',
  },
  auth: {
    disableLocalStrategy: true,
    strategies: [tailscaleStrategy],
  },
  access: {
    read: selfOrAdmin,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
    admin: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'email',
      label: 'メールアドレス（Tailscale のアカウント）',
      type: 'email',
      required: true,
      unique: true,
      index: true,
      hooks: { beforeValidate: [({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value)] },
    },
    { name: 'name', label: '名前', type: 'text' },
    {
      name: 'role',
      label: '権限',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: '管理者（メンバーの管理もできる）', value: 'admin' },
        { label: '編集者（記事・バナー・画像の作成と公開）', value: 'editor' },
      ],
      access: { update: adminOnlyField },
    },
  ],
}
