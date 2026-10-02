'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

// 商品の画面を開いたときに、Shopify の最新の内容を取り込む（商品の正は Shopify）。
// 変わっていたら読み込み直す。同じ商品で何度も読み込み直さないよう、1回だけにする
export function ShopifyRefresher() {
  const { id } = useDocumentInfo()
  const [message, setMessage] = useState('Shopify の最新の内容を確認しています…')

  useEffect(() => {
    if (!id) return
    const key = `shopify-refreshed-${id}`
    // 取り込んで読み込み直した直後か（そのときは、もう一度読み込み直さない）
    const justRefreshed = Boolean(sessionStorage.getItem(key))
    sessionStorage.removeItem(key)
    fetch(`/api/products/${id}/refresh`, { method: 'POST', credentials: 'include' })
      .then((res) => res.json())
      .then((body: { changed?: boolean; message?: string }) => {
        if (body.changed && !justRefreshed) {
          sessionStorage.setItem(key, '1')
          window.location.reload()
        } else if (justRefreshed) {
          setMessage('Shopify の最新の内容を取り込みました。')
        } else {
          setMessage(body.message ?? 'Shopify の内容と一致しています。')
        }
      })
      .catch(() => setMessage('Shopify の内容を確認できませんでした。'))
  }, [id])

  if (!id) return null
  return <p style={{ margin: '0 0 var(--base)', color: 'var(--theme-elevation-500)', fontSize: 13 }}>{message}</p>
}
