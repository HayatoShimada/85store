import { convertLexicalToHTML, type HTMLConvertersFunction } from '@payloadcms/richtext-lexical/html'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { Media } from '../payload-types'
import { embedToHTML, type EmbedShape } from '../lib/embed'
import { exportImage } from './image'

const escapeHTML = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// 写真を microCMS と同じ構造（<figure><img width height alt></figure>）で出す。
// サイトの lib/content-images.ts が data-avif / data-webp から <picture> と srcset を組み立てる。
function figure(media: Media | number | null | undefined, caption?: string | null, className?: string): string {
  if (!media || typeof media !== 'object') return ''
  const image = exportImage(media)
  if (!image) return ''
  const attrs = [
    `src="${escapeHTML(image.url)}"`,
    `alt="${escapeHTML(image.alt ?? '')}"`,
    `width="${image.width}"`,
    `height="${image.height}"`,
    image.avif ? `data-avif="${escapeHTML(image.avif)}"` : '',
    image.webp ? `data-webp="${escapeHTML(image.webp)}"` : '',
  ].filter(Boolean)
  const figcaption = caption ? `<figcaption>${escapeHTML(caption)}</figcaption>` : ''
  return `<figure${className ? ` class="${className}"` : ''}><img ${attrs.join(' ')}>${figcaption}</figure>`
}

const converters: HTMLConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  // 空の段落は <p></p>（サイトの CSS で詰める。microCMS と同じ）
  paragraph: ({ node, nodesToHTML, providedStyleTag }) => {
    const children = nodesToHTML({ nodes: (node as unknown as { children: never[] }).children })
    return `<p${providedStyleTag}>${children.join('')}</p>`
  },
  upload: ({ node }) => {
    const upload = node as unknown as { value: Media | number; fields?: { caption?: string } }
    return figure(upload.value, upload.fields?.caption)
  },
  blocks: {
    gallery: ({ node }: { node: unknown }) => {
      const fields = (node as unknown as { fields: { images?: (Media | number)[]; caption?: string } }).fields
      const images = (fields.images ?? []).map((media) => figure(media, null, 'in-gallery')).filter(Boolean)
      if (images.length === 0) return ''
      // 3枚なら3列、それ以外は2列（サイトの .article-gallery）
      const style = images.length === 3 ? ' style="grid-template-columns: repeat(3, 1fr);"' : ''
      const caption = fields.caption ? `<p class="article-gallery-caption">${escapeHTML(fields.caption)}</p>` : ''
      return `<div class="article-gallery"${style}>${images.join('')}</div>${caption}`
    },
    embed: ({ node }: { node: unknown }) => {
      const fields = (node as unknown as { fields: { url?: string; shape?: EmbedShape } }).fields
      return fields.url ? embedToHTML(fields.url, fields.shape ?? 'auto') : ''
    },
  },
})

// Lexical の変換が付ける空の属性や改行を取り除く（<li class="" style="" value="1"> → <li>）
function tidy(html: string): string {
  return html.replace(/<(\w+)(\s[^>]*)>/g, (_match, tag: string, attrs: string) => {
    const kept = attrs
      .replace(/\s(?:class|style)=""/g, '')
      .replace(/\svalue="\d+"/g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s+$/, '')
    return `<${tag}${kept}>`
  })
}

export function contentToHTML(content: unknown): string {
  if (!content || typeof content !== 'object') return ''
  return tidy(convertLexicalToHTML({
    data: content as SerializedEditorState,
    converters,
    disableContainer: true,
    disableIndent: true,
    disableTextAlign: true,
  }))
}
