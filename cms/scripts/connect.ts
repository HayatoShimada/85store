// DB に接続するだけ（開発時は Payload がテーブルを今のコレクションに合わせる）。本番の DB を移行の基準に合わせるときに使う
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
payload.logger.info('接続しました')
process.exit(0)
