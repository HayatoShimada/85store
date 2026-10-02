// 85crm の内部 API（85pi の tailscale serve、tailnet 内のみ）を呼ぶ。
// CRM_INTERNAL_URL（例: https://85pi.<tailnet>.ts.net:8443）と CRM_INTERNAL_TOKEN（85crm の INTERNAL_API_TOKEN と同じ値）
export const crmConfigured = () => Boolean(process.env.CRM_INTERNAL_URL && process.env.CRM_INTERNAL_TOKEN)

export async function crmFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!crmConfigured()) throw new Error('85crm の設定（CRM_INTERNAL_URL / CRM_INTERNAL_TOKEN）がありません')
  const res = await fetch(`${process.env.CRM_INTERNAL_URL!.replace(/\/$/, '')}${path}`, {
    ...init,
    headers: { ...(init.headers ?? {}), 'X-Internal-Token': process.env.CRM_INTERNAL_TOKEN! },
    signal: AbortSignal.timeout(120_000),
  })
  if (!res.ok) {
    const detail = await res.json().then((b: { detail?: string }) => b.detail).catch(() => null)
    throw new Error(`85crm: ${res.status} ${detail ?? ''}`.trim())
  }
  return (await res.json()) as T
}

export type GeneratedDescription = {
  description_html: string
  lead: string
  condition_comment: string
  color: string
  suggested_condition: string
  used_image: boolean
}
