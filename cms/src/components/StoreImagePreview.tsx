'use client'

import { useFormFields } from '@payloadcms/ui'

// Shopify にある画像（コレクション・記事）のサムネイル。差し替えるときは下の「新しい画像」に選ぶ
export function StoreImagePreview() {
  const url = useFormFields(([fields]) => fields.imageUrl?.value as string | undefined)
  if (!url) return null
  const thumb = url.includes('cdn.shopify.com') ? `${url}${url.includes('?') ? '&' : '?'}width=480` : url
  return (
    <div style={{ marginBottom: 'var(--base)' }}>
      <p style={{ margin: '0 0 8px', fontSize: 13 }}>今の画像</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={thumb} alt="" style={{ maxWidth: 240, maxHeight: 240, objectFit: 'contain', borderRadius: 4 }} />
    </div>
  )
}
