import fs from 'node:fs/promises'
import path from 'node:path'
import type { ProductPhoto } from '../payload-types'
import { assertNoUserErrors, shopifyGraphQL } from './client'

// 新しく撮った商品写真を Shopify に直接アップロードする（staged upload）。
// 写真は Shopify にだけ置く（R2 には置かない）。Payload の手元のファイルは、同期できたら消す。
export const PRODUCT_PHOTOS_DIR = path.resolve(process.env.PRODUCT_PHOTOS_DIR || 'data/product-photos')

export async function stagePhoto(photo: ProductPhoto): Promise<string> {
  if (!photo.filename) throw new Error('写真のファイルがありません')
  const data = await fs.readFile(path.join(PRODUCT_PHOTOS_DIR, photo.filename))
  const mimeType = photo.mimeType || 'image/jpeg'
  const res = await shopifyGraphQL<{
    stagedUploadsCreate: {
      stagedTargets: { url: string; resourceUrl: string; parameters: { name: string; value: string }[] }[]
      userErrors: { field: string[] | null; message: string }[]
    }
  }>(
    `mutation($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) { stagedTargets { url resourceUrl parameters { name value } } userErrors { field message } }
    }`,
    { input: [{ resource: 'IMAGE', filename: photo.filename, mimeType, httpMethod: 'POST', fileSize: String(data.length) }] },
  )
  assertNoUserErrors('stagedUploadsCreate', res.stagedUploadsCreate.userErrors)
  const target = res.stagedUploadsCreate.stagedTargets[0]
  const form = new FormData()
  for (const p of target.parameters) form.append(p.name, p.value)
  form.append('file', new Blob([new Uint8Array(data)], { type: mimeType }), photo.filename)
  const upload = await fetch(target.url, { method: 'POST', body: form })
  if (!upload.ok) throw new Error(`写真のアップロードに失敗しました: ${upload.status}`)
  return target.resourceUrl
}
