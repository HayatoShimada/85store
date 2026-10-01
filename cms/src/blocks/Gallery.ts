import type { Block } from 'payload'

// 写真を横に並べる（2〜4枚）
export const GalleryBlock: Block = {
  slug: 'gallery',
  labels: { singular: '写真の横並び', plural: '写真の横並び' },
  fields: [
    {
      name: 'images',
      label: '写真',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      required: true,
      minRows: 2,
      maxRows: 4,
    },
    { name: 'caption', label: 'キャプション', type: 'text' },
  ],
}
