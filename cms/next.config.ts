import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  output: 'standalone',
  // AGENTS.md / CLAUDE.md を自動で作らない（リポジトリ直下の CLAUDE.md を使う）
  agentRules: false,
  turbopack: { root: path.resolve(dirname) },
  // CMS には管理画面しかないので、トップは管理画面へ
  redirects: async () => [{ source: '/', destination: '/admin', permanent: false }],
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
