import type { CollectionConfig } from 'payload'
import { loggedIn } from '../access'

// 商品の写真。R2 の products/ に置き、Shopify にはその URL から取り込ませる。
// サイズ違いは Shopify が作るので作らない。長辺 2048px に縮め、撮影情報（EXIF）は消す（sharp の既定）
export const ProductPhotos: CollectionConfig = {
  slug: 'productPhotos',
  labels: { singular: '商品写真', plural: '商品写真' },
  access: { read: () => true, create: loggedIn, update: loggedIn, delete: loggedIn },
  admin: { group: '商品', hidden: true },
  fields: [{ name: 'alt', label: '代替テキスト', type: 'text' }],
  upload: {
    mimeTypes: ['image/*'],
    resizeOptions: { width: 2048, height: 2048, fit: 'inside', withoutEnlargement: true },
    formatOptions: { format: 'jpeg', options: { quality: 85, mozjpeg: true } },
    focalPoint: false,
    crop: false,
  },
}
