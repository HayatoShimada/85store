import type { CollectionConfig, ImageSize } from 'payload'
import { loggedIn } from '../access'

// 画像。保存先は R2（payload.config.ts の s3Storage）。
// アップロード時に、幅 480/800/1200/1600 の avif と webp を作る（元より大きくはしない）。
export const IMAGE_WIDTHS = [480, 800, 1200, 1600] as const
export const IMAGE_FORMATS = ['avif', 'webp'] as const

const imageSizes: ImageSize[] = IMAGE_FORMATS.flatMap((format) =>
  IMAGE_WIDTHS.map((width) => ({
    name: `${format}${width}`,
    width,
    withoutEnlargement: true,
    formatOptions: format === 'avif' ? { format, options: { quality: 55, effort: 3 } } : { format, options: { quality: 80 } },
  })),
)

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: '画像', plural: '画像' },
  access: { read: () => true, create: loggedIn, update: loggedIn, delete: loggedIn },
  admin: { group: 'サイト（85-store.com）', defaultColumns: ['filename', 'alt', 'updatedAt'] },
  fields: [
    { name: 'alt', label: '代替テキスト（画像の説明）', type: 'text' },
    // microCMS から移した画像の元の URL（移行のやり直しで重複させないため）
    { name: 'sourceUrl', type: 'text', index: true, admin: { readOnly: true, hidden: true } },
  ],
  upload: {
    mimeTypes: ['image/*'],
    imageSizes,
    adminThumbnail: 'webp480',
    focalPoint: false,
    crop: false,
  },
}
