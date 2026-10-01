import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { ja } from '@payloadcms/translations/languages/ja'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Banners } from './collections/Banners'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { publicUrl, r2Enabled, s3Config } from './lib/bucket'

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
  collections: [Posts, Banners, Categories, Media, Users],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URL || 'file:./data/payload.db' },
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
