// 埋め込みブロック（URL / <iframe> のコード）を、サイトに出す HTML にする。
// 形は microCMS のリッチエディタが出していたものと同じ（サイトの CSS をそのまま使うため）。

export type EmbedShape = 'auto' | '16:9' | '4:3' | '9:16' | 'compact'

type Resolved = { src: string; shape: Exclude<EmbedShape, 'auto'>; allow: string; rounded: boolean }

const ALLOW_VIDEO = 'accelerometer *; clipboard-write *; encrypted-media *; gyroscope *; picture-in-picture *; web-share *;'
const ALLOW_AUDIO = 'clipboard-write *; encrypted-media *; fullscreen *; picture-in-picture *;'

const escapeAttr = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

// 貼られた文字列から URL を取り出す（<iframe src="..."> にも対応）
export function extractUrl(input: string): URL | null {
  const raw = input.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i)?.[1] ?? input.trim()
  try {
    const url = new URL(raw.replace(/&amp;/g, '&'))
    return url.protocol === 'https:' ? url : null
  } catch {
    return null
  }
}

export function resolveEmbed(input: string, shape: EmbedShape = 'auto'): Resolved | null {
  const url = extractUrl(input)
  if (!url) return null
  const host = url.hostname.replace(/^www\./, '')
  let resolved: Resolved = { src: url.toString(), shape: '16:9', allow: ALLOW_VIDEO, rounded: false }

  if (host === 'youtube.com' || host === 'youtu.be' || host === 'm.youtube.com') {
    const shorts = url.pathname.match(/^\/shorts\/([\w-]+)/)
    const id =
      shorts?.[1] ??
      (host === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v')) ??
      url.pathname.match(/^\/embed\/([\w-]+)/)?.[1]
    if (id) resolved = { ...resolved, src: `https://www.youtube.com/embed/${id}`, shape: shorts ? '9:16' : '16:9' }
  } else if (host === 'open.spotify.com') {
    const match = url.pathname.match(/^\/(?:embed\/)?(episode|show|track|album|playlist|artist)\/(\w+)/)
    if (match) {
      resolved = {
        src: `https://open.spotify.com/embed/${match[1]}/${match[2]}`,
        shape: 'compact',
        allow: ALLOW_AUDIO,
        rounded: true,
      }
    }
  } else if (host === 'instagram.com') {
    const match = url.pathname.match(/^\/(p|reel)\/([\w-]+)/)
    if (match) resolved = { ...resolved, src: `https://www.instagram.com/${match[1]}/${match[2]}/embed`, shape: '9:16' }
  } else if (host === 'google.com' && url.pathname.startsWith('/maps/embed')) {
    resolved = { ...resolved, shape: '4:3', allow: '' }
  }

  if (shape !== 'auto') resolved.shape = shape
  return resolved
}

const PADDING: Record<string, string> = { '16:9': '56.25%', '4:3': '75%', '9:16': '177.7778%' }

export function embedToHTML(input: string, shape: EmbedShape = 'auto'): string {
  const embed = resolveEmbed(input, shape)
  if (!embed) return ''
  const iframeStyle = `top: 0; left: 0; width: 100%; height: 100%; position: absolute; border: 0;${embed.rounded ? ' border-radius: 12px;' : ''}`
  const allow = embed.allow ? ` allow="${embed.allow}"` : ''
  const iframe = `<iframe src="${escapeAttr(embed.src)}" style="${iframeStyle}" allowfullscreen${allow} loading="lazy"></iframe>`
  if (embed.shape === 'compact') {
    return `<div style="left: 0; width: 100%; height: 152px; position: relative;">${iframe}</div>`
  }
  const box = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: ${PADDING[embed.shape]};">${iframe}</div>`
  return embed.shape === '9:16' ? `<div style="max-width: 56vh;">${box}</div>` : box
}
