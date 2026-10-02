import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { ja } from '@payloadcms/translations/languages/ja'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Banners } from './collections/Banners'
import { Brands } from './collections/Brands'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { ProductPhotos } from './collections/ProductPhotos'
import { Products } from './collections/Products'
import { ShopifyCollections } from './collections/store/ShopifyCollections'
import { StoreArticles } from './collections/store/StoreArticles'
import { StoreBlogs } from './collections/store/StoreBlogs'
import { StoreMenus } from './collections/store/StoreMenus'
import { StorePages } from './collections/store/StorePages'
import { Users } from './collections/Users'
import { migrations } from './migrations'
import { publicUrl, r2Enabled, s3Config } from './lib/bucket'
import { shopifyEndpoints } from './shopify/import'
import { refreshProductsTask, syncProductTask } from './shopify/sync'
import { deleteStoreResourceTask, refreshStoreTask, storeEndpoints, syncStoreResourceTask } from './shopify/store'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.CMS_SERVER_URL || undefined,
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' | 85-Store CMS' },
  },
  i18n: { supportedLanguages: { ja }, fallbackLanguage: 'ja' },
  collections: [
    Products,
    ShopifyCollections,
    Brands,
    ProductPhotos,
    StorePages,
    StoreArticles,
    StoreBlogs,
    StoreMenus,
    Posts,
    Banners,
    Categories,
    Media,
    Users,
  ],
  endpoints: [...shopifyEndpoints, ...storeEndpoints],
  // Shopify との同期はジョブで行う（失敗したらやり直す）。保存の直後に送り、取りこぼしは1分ごとに拾う。
  // Shopify で変わった商品・ストアの内容は10分ごとに取り込む（正は Shopify）
  jobs: {
    tasks: [syncProductTask, refreshProductsTask, syncStoreResourceTask, deleteStoreResourceTask, refreshStoreTask],
    autoRun: [{ cron: '* * * * *', queue: 'shopify', limit: 10 }],
    shouldAutoRun: () => process.env.SHOPIFY_SYNC_MODE !== 'off' || process.env.SHOPIFY_STORE_SYNC_MODE !== 'off',
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URL || 'file:./data/payload.db' },
    // Litestream（バックアップ）が DB を読んでいる間に書き込むと "database is locked" になるので、待つ
    busyTimeout: 10_000,
    wal: true,
    // 本番（85pi）は起動時に src/migrations を適用する。コレクションを変えたら npm run payload migrate:create <名前>
    prodMigrations: migrations,
  }),
  sharp,
  plugins: [
    // 画像は R2 に置き、media.85-store.com から直接配信する（R2 の設定が無いときはローカルに保存）
    s3Storage({
      enabled: r2Enabled,
      bucket: process.env.R2_BUCKET || '',
      config: s3Config(),
      collections: {
        media: {
          prefix: 'media',
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => publicUrl(`${prefix ?? 'media'}/${filename}`),
        },
      },
    }),
  ],
})
