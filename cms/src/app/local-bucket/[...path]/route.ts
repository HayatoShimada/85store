import fs from 'node:fs/promises'
import path from 'node:path'
import { LOCAL_BUCKET_DIR, r2Enabled } from '../../../lib/bucket'

// ローカルでの開発用: R2 の代わりに .local-bucket/ の書き出しを配信する（本番では使わない）
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  if (r2Enabled || process.env.NODE_ENV === 'production') return new Response('Not Found', { status: 404 })
  const file = path.resolve(LOCAL_BUCKET_DIR, ...(await params).path)
  if (!file.startsWith(LOCAL_BUCKET_DIR + path.sep)) return new Response('Not Found', { status: 404 })
  try {
    const body = await fs.readFile(file)
    return new Response(body, { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-cache' } })
  } catch {
    return new Response('Not Found', { status: 404 })
  }
}
