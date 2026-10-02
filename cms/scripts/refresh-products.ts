// Shopify で変わった商品を取り込む（10分ごとのジョブと同じ処理を、手で1回実行する）
import { getPayload } from 'payload'
import config from '@payload-config'
import { refreshChangedProducts } from '../src/shopify/sync'

const payload = await getPayload({ config })
console.log(await refreshChangedProducts(payload))
process.exit(0)
