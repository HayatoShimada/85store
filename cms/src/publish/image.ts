import type { Media } from '../payload-types'
import { IMAGE_FORMATS, IMAGE_WIDTHS } from '../collections/Media'

// サイトに書き出す画像の情報
export type ExportedImage = {
  url: string // 元画像
  width: number
  height: number
  alt?: string
  avif?: string // srcset（"url 480w, url 800w, …"）
  webp?: string
  og?: string // SNS 用（幅1200の webp）
}

// ローカルでの開発時、Payload は /api/media/file/… の相対 URL を返すので、絶対 URL にする
const absolute = (url: string) =>
  url.startsWith('/') ? `${(process.env.CMS_SERVER_URL || 'http://localhost:3001').replace(/\/$/, '')}${url}` : url

export function exportImage(media: Media): ExportedImage | null {
  if (!media.url || !media.width || !media.height) return null
  const sizes = (media.sizes ?? {}) as Record<string, { url?: string | null; width?: number | null } | undefined>
  const srcset = (format: string) => {
    const seen = new Set<number>()
    const entries: string[] = []
    for (const width of IMAGE_WIDTHS) {
      const size = sizes[`${format}${width}`]
      if (!size?.url || !size.width || seen.has(size.width)) continue
      seen.add(size.width)
      entries.push(`${absolute(size.url)} ${size.width}w`)
    }
    return entries.length ? entries.join(', ') : undefined
  }
  const [avif, webp] = IMAGE_FORMATS.map(srcset)
  const og = sizes.webp1200?.url
  return {
    url: absolute(media.url),
    width: media.width,
    height: media.height,
    ...(media.alt ? { alt: media.alt } : {}),
    ...(avif ? { avif } : {}),
    ...(webp ? { webp } : {}),
    ...(og ? { og: absolute(og) } : {}),
  }
}
