import type { Payload, RichTextField } from 'payload'
import { JSDOM } from 'jsdom'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

// 商品の説明文（Lexical）と、Shopify に送る HTML の変換

export function descriptionToHTML(state: unknown): string {
  if (!state || typeof state !== 'object') return ''
  return convertLexicalToHTML({ data: state as SerializedEditorState, disableContainer: true, disableIndent: true, disableTextAlign: true })
}

// 説明文に埋め込まれた画像（<img>）は、編集用の欄には入れない（商品の画像と結び付けられないため）。
// 送る HTML には残るが、説明文を編集すると消える
export const hasEmbeddedImages = (html: string | null | undefined) => /<img\b/i.test(html ?? '')

export function htmlToDescription(payload: Payload, rawHtml: string | null | undefined) {
  const html = (rawHtml ?? '').replace(/<img\b[^>]*>/gi, '')
  if (!html.trim()) return null
  const products = payload.config.collections.find((c) => c.slug === 'products')!
  return convertHTMLToLexical({ editorConfig: editorConfigFactory.fromField({ field: findDescriptionField(products.fields) }), html, JSDOM })
}

type AnyField = { type: string; name?: string; tabs?: { fields: unknown[] }[]; fields?: unknown[] }

function findDescriptionField(fields: unknown[]): RichTextField {
  const found = search(fields)
  if (!found) throw new Error('説明文の欄が見つかりません')
  return found
}

function search(fields: unknown[]): RichTextField | null {
  for (const field of fields as AnyField[]) {
    if (field.type === 'richText' && field.name === 'description') return field as unknown as RichTextField
    const nested = field.tabs?.flatMap((t) => t.fields) ?? field.fields
    const found = nested ? search(nested) : null
    if (found) return found
  }
  return null
}
