// CMS（Payload、cms/）が R2 に書き出す JSON の型。cms/src/publish/export.ts と合わせる

// 画像。avif / webp はサイズ別の srcset（"url 480w, url 800w, …"）
export interface CmsImage {
  url: string;
  width: number;
  height: number;
  alt?: string;
  avif?: string;
  webp?: string;
  og?: string; // 幅1200の webp
}

// 記事（一覧用。本文なし）
export interface Blog {
  id: string; // microCMS から移した記事はそのコンテンツID（旧 URL /blog/<ID> のリダイレクトに使う）
  slug: string;
  title: string;
  eyecatch?: CmsImage;
  category: string[];
  tags: string[];
  author?: string;
  excerpt?: string;
  description?: string;
  featured: boolean;
  // イベントの記事の日時と会場（CMS の「イベント情報」。開始の日時があるときだけ。会場が無ければお店）
  event?: { startDate: string; endDate?: string; venueName?: string; venueAddress?: string };
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

// 記事（本文の HTML 込み）
export interface BlogPost extends Blog {
  content: string;
}

// トップページのバナー（並び順どおり）
export interface Banner {
  id: string;
  image: CmsImage;
  title?: string;
  subtitle?: string;
  detailButtonUrl?: string;
  order: number;
}
