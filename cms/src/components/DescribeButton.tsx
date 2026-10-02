'use client'

import { useDocumentInfo, useFormModified } from '@payloadcms/ui'
import { useState } from 'react'

// 商品の「説明文を作る」ボタン（85crm の AI で説明文を作り、説明文の欄に入れて保存する）
export function DescribeButton() {
  const { id } = useDocumentInfo()
  const modified = useFormModified()
  const [state, setState] = useState<'idle' | 'busy' | 'error'>('idle')
  const [message, setMessage] = useState('')

  if (!id) return <p style={{ color: 'var(--theme-elevation-500)' }}>説明文の自動作成は、商品を一度保存すると使えます。</p>

  async function run() {
    setState('busy')
    setMessage('作成中です（10秒ほどかかります）…')
    const res = await fetch(`/api/products/${id}/describe`, { method: 'POST', credentials: 'include' })
    const body = (await res.json()) as { ok?: boolean; error?: string; usedImage?: boolean }
    if (!res.ok || !body.ok) {
      setState('error')
      setMessage(body.error ?? '作成できませんでした')
      return
    }
    // 保存した内容を読み直す
    window.location.reload()
  }

  return (
    <div style={{ marginBottom: 'var(--base)' }}>
      <button type="button" className="btn btn--style-secondary btn--size-small" disabled={state === 'busy' || modified} onClick={run}>
        説明文を作る（AI）
      </button>
      <p style={{ margin: '0.5em 0 0', color: state === 'error' ? 'var(--theme-error-500)' : 'var(--theme-elevation-500)' }}>
        {modified
          ? '先に保存してください（保存した内容から作ります）。'
          : message || '写真・採寸・状態ランク・状態のメモから、決まった形式の説明文を作ります。今の説明文は置き換わります。'}
      </p>
    </div>
  )
}
