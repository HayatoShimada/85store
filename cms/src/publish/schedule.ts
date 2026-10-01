import type { Payload } from 'payload'
import { exportAll } from './export'
import { revalidateSite } from './revalidate'

// 保存のたびに書き出す。続けて保存したときは最後の1回にまとめ（2秒待つ）、同時には走らせない。
// 移行スクリプトなどで止めたいときは CMS_DISABLE_AUTO_EXPORT=1
const DELAY_MS = 2000
let timer: ReturnType<typeof setTimeout> | null = null
let running: Promise<void> | null = null
let pending = false

export function scheduleExport(payload: Payload, reason: string): void {
  if (process.env.CMS_DISABLE_AUTO_EXPORT === '1') return
  payload.logger.info(`書き出しを予約: ${reason}`)
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    timer = null
    void run(payload)
  }, DELAY_MS)
}

async function run(payload: Payload): Promise<void> {
  if (running) {
    pending = true
    return
  }
  running = (async () => {
    try {
      const result = await exportAll(payload)
      await revalidateSite(['blogs', 'banners'])
      payload.logger.info(`書き出し完了: 記事 ${result.posts} 件・バナー ${result.banners} 件`)
    } catch (error) {
      payload.logger.error({ err: error }, '書き出しに失敗しました')
    }
  })()
  await running
  running = null
  if (pending) {
    pending = false
    await run(payload)
  }
}
