'use client'

import { useFormFields } from '@payloadcms/ui'

// 写真の行に、Shopify にある画像のサムネイルを出す（取り込んだ既存の画像はファイルを持たないため）
export function ShopifyImagePreview({ path }: { path: string }) {
  const base = path.replace(/\.preview$/, '')
  const url = useFormFields(([fields]) => fields[`${base}.shopifyUrl`]?.value as string | undefined)
  if (!url) return null
  const thumb = url.includes('cdn.shopify.com') ? `${url}${url.includes('?') ? '&' : '?'}width=240` : url
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={thumb} alt="" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 4, marginBottom: 8 }} />
  )
}
