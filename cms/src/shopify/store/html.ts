import type { CollectionSlug, Field, Payload, RichTextField } from 'payload'
import { JSDOM } from 'jsdom'
import {
  convertHTMLToLexical,
  editorConfigFactory,
  FixedToolbarFeature,
  lexicalEditor,
  UploadFeature,
} from '@payloadcms/richtext-lexical'
import { convertLexicalToHTML, type HTMLConvertersFunction } from '@payloadcms/richtext-lexical/html'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { Media } from '../../payload-types'

// ストア（Shopify）の本文の編集。
// 「見たまま」は Lexical で書いて HTML にして送る。画像は「画像」（R2）に上げて、その URL を本文に入れる。
// 画像・埋め込み・装飾の多い既存の本文は、崩さないよう「HTML」のまま編集する

// 見たままで扱える HTML（これ以外のタグ・属性があれば HTML のまま編集する）
const SIMPLE_TAGS = new Set(['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'a', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote'])
const LINK_ATTRS = new Set(['href', 'target', 'rel', 'title'])

export function isSimpleHtml(html: string | null | undefined): boolean {
  for (const match of (html ?? '').matchAll(/<([a-zA-Z0-9]+)([^>]*)>/g)) {
    const tag = match[1].toLowerCase()
    if (!SIMPLE_TAGS.has(tag)) return false
    const attrs = [...match[2].matchAll(/([a-zA-Z-:]+)\s*=/g)].map((m) => m[1].toLowerCase())
    if (attrs.some((name) => !(tag === 'a' && LINK_ATTRS.has(name)))) return false
  }
  return true
}

const UNUSED_FEATURES = ['relationship', 'checklist', 'subscript', 'superscript', 'inlineCode', 'indent', 'align', 'upload']

export const storeEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures.filter((feature) => !UNUSED_FEATURES.includes(feature.key)),
    UploadFeature({ collections: { media: { fields: [] } } }),
    FixedToolbarFeature(),
  ],
})

const escapeHTML = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const converters: HTMLConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: ({ node }) => {
    const media = (node as unknown as { value: Media | number }).value
    if (!media || typeof media !== 'object' || !media.url) return ''
    const size = media.width && media.height ? ` width="${media.width}" height="${media.height}"` : ''
    return `<p><img src="${escapeHTML(media.url)}" alt="${escapeHTML(media.alt ?? '')}"${size}></p>`
  },
})

// Lexical → Shopify に送る HTML（空の属性を取り除く）
export function lexicalToHtml(state: unknown): string {
  if (!state || typeof state !== 'object') return ''
  const html = convertLexicalToHTML({
    data: state as SerializedEditorState,
    converters,
    disableContainer: true,
    disableIndent: true,
    disableTextAlign: true,
  })
  return html.replace(/<(\w+)(\s[^>]*)>/g, (_m, tag: string, attrs: string) => {
    const kept = attrs.replace(/\s(?:class|style)=""/g, '').replace(/\svalue="\d+"/g, '').replace(/\s+/g, ' ').replace(/\s+$/, '')
    return `<${tag}${kept}>`
  })
}

// HTML → Lexical（見たままで扱える HTML だけ）
export function htmlToLexical(payload: Payload, collection: CollectionSlug, fieldName: string, html: string | null | undefined) {
  if (!html?.trim()) return null
  const config = payload.config.collections.find((c) => c.slug === collection)
  const field = config && findField(config.fields, fieldName)
  if (!field) throw new Error(`${collection}.${fieldName} の欄が見つかりません`)
  return convertHTMLToLexical({ editorConfig: editorConfigFactory.fromField({ field }), html, JSDOM })
}

type AnyField = { type: string; name?: string; tabs?: { fields: unknown[] }[]; fields?: unknown[] }

function findField(fields: unknown[], name: string): RichTextField | null {
  for (const field of fields as AnyField[]) {
    if (field.type === 'richText' && field.name === name) return field as unknown as RichTextField
    const nested = field.tabs?.flatMap((t) => t.fields) ?? field.fields
    const found = nested ? findField(nested, name) : null
    if (found) return found
  }
  return null
}

// 本文の欄（モード・見たまま・HTML）。name は Shopify に送る HTML の欄の名前
export function bodyFields(name: string, label: string): Field[] {
  const mode = `${name}Mode`
  const rich = `${name}Rich`
  return [
    {
      name: mode,
      label: `${label}の編集のしかた`,
      type: 'radio',
      defaultValue: 'visual',
      options: [
        { label: '見たまま', value: 'visual' },
        { label: 'HTML を直接', value: 'html' },
      ],
      admin: {
        layout: 'horizontal',
        description: '画像や埋め込みのある既存の本文は「HTML を直接」で取り込んでいます。「見たまま」に切り替えると、見たままで扱えない部分（画像・埋め込み・装飾）は消えます。',
      },
    },
    {
      name: rich,
      label,
      type: 'richText',
      editor: storeEditor,
      admin: { condition: (_data, sibling) => sibling?.[mode] !== 'html', description: '写真は「画像」から入れられます（85-store.com と同じ R2 に置かれます）。' },
    },
    {
      name,
      label: `${label}（HTML）`,
      type: 'code',
      admin: { language: 'html', condition: (_data, sibling) => sibling?.[mode] === 'html' },
    },
  ]
}

// 保存の前に、モードに合わせて HTML を作る（見たままを編集したとき）・Lexical を作る（見たままに切り替えたとき）
export function applyBody(
  payload: Payload,
  collection: CollectionSlug,
  name: string,
  data: Record<string, unknown>,
  original: Record<string, unknown> | undefined,
) {
  const mode = `${name}Mode`
  const rich = `${name}Rich`
  const nowMode = data[mode] ?? original?.[mode]
  if (nowMode !== 'visual') return
  const switched = original && original[mode] === 'html' && data[mode] === 'visual'
  if (switched && !data[rich]) {
    // HTML から作り直す（見たままで扱えない部分は落ちる）
    data[rich] = htmlToLexical(payload, collection, rich, String(data[name] ?? original?.[name] ?? '').replace(/<img\b[^>]*>/gi, ''))
  }
  if (data[rich] === undefined) return
  const html = lexicalToHtml(data[rich])
  if (switched || html !== lexicalToHtml(original?.[rich])) data[name] = html
}
