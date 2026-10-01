import { largestFromSrcset } from "@/lib/cms-image";

// 記事本文カラムの表示幅（max-container内の余白を除いた幅）
const SIZES = "(max-width: 1024px) 100vw, 1000px";

// 記事本文の画像を最適化する
// CMS は <img data-avif="srcset" data-webp="srcset"> を書き出すので、AVIF/WebP の <picture>・srcset・遅延読み込みにする
export function optimizeContentImages(html: string): string {
  return groupPortraitFigures(convertImages(html));
}

function convertImages(html: string): string {
  return html.replace(/<img\b([^>]*?)\/?>/gi, (match, attrs: string) => {
    const webp = getAttr(attrs, "data-webp");
    if (!webp) return match;
    const avif = getAttr(attrs, "data-avif");

    // 既存の属性（alt/width/height/class等）は残し、src系と読み込み制御だけ差し替える
    const keptAttrs = attrs
      .replace(/\s(src|srcset|sizes|loading|decoding|data-avif|data-webp)=("[^"]*"|'[^']*')/gi, "")
      .trim();
    const fallback = srcAtLeast(webp, 800);

    const picture =
      `<picture>` +
      (avif ? `<source type="image/avif" srcset="${avif}" sizes="${SIZES}">` : "") +
      `<img ${keptAttrs} src="${fallback}" srcset="${webp}" sizes="${SIZES}" loading="lazy" decoding="async">` +
      `</picture>`;

    // クリック・タップで拡大表示するためのボタン（components/ImageLightbox.tsx が処理する）
    const zoomSrc = largestFromSrcset(webp) ?? getAttr(attrs, "src");
    return `<button type="button" class="image-zoom" data-zoom-src="${zoomSrc}" aria-label="画像を拡大表示">${picture}</button>`;
  });
}

// srcset から、幅が min 以上の最初の URL（なければいちばん大きいもの）
function srcAtLeast(srcset: string, min: number): string | undefined {
  const entries = srcset.split(",").map((entry) => entry.trim().split(/\s+/));
  return (entries.find(([, w]) => parseInt(w) >= min) ?? entries[entries.length - 1])?.[0];
}

function getAttr(attrs: string, name: string): string | undefined {
  const match = attrs.match(new RegExp(`\\s${name}=("([^"]*)"|'([^']*)')`, "i"));
  return match ? (match[2] ?? match[3]) : undefined;
}

// <figure> に縦長/横長のクラスを付け、連続する縦長写真を2枚ずつ横に並べる
function groupPortraitFigures(html: string): string {
  const annotated = html.replace(/<figure>([\s\S]*?)<\/figure>/gi, (match, inner: string) => {
    const width = Number(getAttr(inner, "width"));
    const height = Number(getAttr(inner, "height"));
    if (!width || !height) return match;
    return `<figure class="${height > width ? "is-portrait" : "is-landscape"}">${inner}</figure>`;
  });

  return annotated.replace(
    /(<figure class="is-portrait">(?:(?!<\/figure>)[\s\S])*<\/figure>)\s*(<figure class="is-portrait">(?:(?!<\/figure>)[\s\S])*<\/figure>)/gi,
    '<div class="article-gallery">$1$2</div>'
  );
}
