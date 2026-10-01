// 公開中の記事・バナーをすべて書き出し直す（npm run export）
import { getPayload } from 'payload'
import config from '@payload-config'
import { exportAll } from '../src/publish/export'
import { revalidateSite } from '../src/publish/revalidate'

const payload = await getPayload({ config })
const result = await exportAll(payload)
await revalidateSite(['blogs', 'banners'])
console.log(`書き出し: 記事 ${result.posts} 件・バナー ${result.banners} 件`)
process.exit(0)
