const MICROCMS_IMAGE_HOST = "images.microcms-assets.io";
const WIDTHS = [480, 800, 1200, 1600];
// 記事本文カラムの表示幅（max-container内の余白を除いた幅）
const SIZES = "(max-width: 1024px) 100vw, 1000px";

// 記事本文のmicroCMS画像を最適化する
// 原寸JPEG/PNGのまま配信されていたため、AVIF/WebP・srcset・遅延読み込みに置き換える
export function optimizeContentImages(html: string): string {
  return html.replace(/<img\b([^>]*?)\/?>/gi, (match, attrs: string) => {
    const src = getAttr(attrs, "src");
    if (!src) return match;

    let url: URL;
    try {
      url = new URL(src.replace(/&amp;/g, "&"));
    } catch {
      return match;
    }
    if (url.hostname !== MICROCMS_IMAGE_HOST) return match;

    const originalWidth = Number(getAttr(attrs, "width")) || undefined;
    const widths = WIDTHS.filter((w) => !originalWidth || w < originalWidth);
    if (originalWidth && originalWidth <= WIDTHS[WIDTHS.length - 1]) widths.push(originalWidth);

    const srcSetFor = (format: string) =>
      widths.map((w) => `${withParams(url, { fm: format, w })} ${w}w`).join(", ");
    const fallbackWidth = widths.find((w) => w >= 800) ?? widths[widths.length - 1];

    // 既存の属性（alt/width/height/class等）は残し、src系と読み込み制御だけ差し替える
    const keptAttrs = attrs
      .replace(/\s(src|srcset|sizes|loading|decoding)=("[^"]*"|'[^']*')/gi, "")
      .trim();

    return (
      `<picture>` +
      `<source type="image/avif" srcset="${srcSetFor("avif")}" sizes="${SIZES}">` +
      `<img ${keptAttrs} src="${withParams(url, { fm: "webp", w: fallbackWidth })}" ` +
      `srcset="${srcSetFor("webp")}" sizes="${SIZES}" loading="lazy" decoding="async">` +
      `</picture>`
    );
  });
}

function getAttr(attrs: string, name: string): string | undefined {
  const match = attrs.match(new RegExp(`\\s${name}=("([^"]*)"|'([^']*)')`, "i"));
  return match ? (match[2] ?? match[3]) : undefined;
}

function withParams(url: URL, params: Record<string, string | number>): string {
  const next = new URL(url);
  for (const [key, value] of Object.entries(params)) {
    next.searchParams.set(key, String(value));
  }
  // HTML属性に埋め込むため & をエスケープ
  return next.toString().replace(/&/g, "&amp;");
}
