import crypto from 'node:crypto'

// サイトの /api/revalidate を呼び、キャッシュ（タグ blogs / banners）を作り直させる
export async function revalidateSite(apis: string[]): Promise<void> {
  const url = process.env.SITE_REVALIDATE_URL
  const secret = process.env.CMS_WEBHOOK_SECRET
  if (!url || !secret) return
  for (const api of apis) {
    const body = JSON.stringify({ api })
    const signature = crypto.createHmac('sha256', secret).update(body).digest('hex')
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-cms-signature': signature },
      body,
    })
    if (!res.ok) throw new Error(`revalidate ${api}: ${res.status} ${await res.text()}`)
  }
}
