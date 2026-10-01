import { DeleteObjectsCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import fs from 'node:fs/promises'
import path from 'node:path'

// 書き出し先（R2）。R2 の設定が無いとき（ローカルでの開発）は .local-bucket/ に書き、
// /local-bucket/... で配信する（src/app/local-bucket）。

const env = process.env
export const r2Enabled = Boolean(env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && env.R2_BUCKET)

export const LOCAL_BUCKET_DIR = path.resolve(env.LOCAL_BUCKET_DIR || '.local-bucket')
const localBaseUrl = () => `${(env.CMS_SERVER_URL || 'http://localhost:3001').replace(/\/$/, '')}/local-bucket`

// 公開 URL の起点（例: https://media.85-store.com）
export const publicBaseUrl = () => (r2Enabled ? (env.MEDIA_PUBLIC_URL || '').replace(/\/$/, '') : localBaseUrl())
export const publicUrl = (key: string) => `${publicBaseUrl()}/${key.split('/').map(encodeURIComponent).join('/')}`

export const s3Config = () => ({
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: 'auto',
  credentials: { accessKeyId: env.R2_ACCESS_KEY_ID!, secretAccessKey: env.R2_SECRET_ACCESS_KEY! },
})

let client: S3Client | null = null
const s3 = () => (client ??= new S3Client(s3Config()))

export async function putObject(key: string, body: string, contentType: string): Promise<void> {
  if (!r2Enabled) {
    const file = path.join(LOCAL_BUCKET_DIR, key)
    await fs.mkdir(path.dirname(file), { recursive: true })
    await fs.writeFile(file, body)
    return
  }
  await s3().send(
    new PutObjectCommand({ Bucket: env.R2_BUCKET, Key: key, Body: body, ContentType: contentType, CacheControl: 'no-cache' }),
  )
}

export async function listKeys(prefix: string): Promise<string[]> {
  if (!r2Enabled) {
    const dir = path.join(LOCAL_BUCKET_DIR, prefix)
    const names = await fs.readdir(dir).catch(() => [] as string[])
    return names.map((name) => `${prefix.replace(/\/$/, '')}/${name}`)
  }
  const keys: string[] = []
  let token: string | undefined
  do {
    const res = await s3().send(new ListObjectsV2Command({ Bucket: env.R2_BUCKET, Prefix: prefix, ContinuationToken: token }))
    for (const item of res.Contents ?? []) if (item.Key) keys.push(item.Key)
    token = res.IsTruncated ? res.NextContinuationToken : undefined
  } while (token)
  return keys
}

export async function deleteKeys(keys: string[]): Promise<void> {
  if (keys.length === 0) return
  if (!r2Enabled) {
    await Promise.all(keys.map((key) => fs.rm(path.join(LOCAL_BUCKET_DIR, key), { force: true })))
    return
  }
  for (let i = 0; i < keys.length; i += 1000) {
    await s3().send(
      new DeleteObjectsCommand({ Bucket: env.R2_BUCKET, Delete: { Objects: keys.slice(i, i + 1000).map((Key) => ({ Key })) } }),
    )
  }
}
