import type { MicroCMSImage, MicroCMSDate, MicroCMSContentId } from "microcms-js-sdk";

// MicroCMS カテゴリ
export interface Category extends MicroCMSContentId, MicroCMSDate {
  name: string;
}

// MicroCMS ブログ記事
export interface Blog extends MicroCMSContentId, MicroCMSDate {
  title: string;
  content: string; // HTML形式のリッチエディタコンテンツ
  eyecatch?: MicroCMSImage;
  published?: boolean;
  featured?: boolean;
  category?: string[]; // カテゴリ名の配列
  tags?: string[];
  author?: string;
  excerpt?: string;
  description?: string; // 記事の説明文
}

// MicroCMS 商品
export interface Product extends MicroCMSContentId, MicroCMSDate {
  name: string;
  shopifyHandle?: string;
  category?: string;
  price?: number;
  images?: MicroCMSImage[];
  description?: string;
  featured?: boolean;
}

// MicroCMS バナー
export interface Banner extends MicroCMSContentId, MicroCMSDate {
  image: MicroCMSImage;
  title?: string;
  subtitle?: string;
  showOnlineShopButton?: boolean;
  showBlogButton?: boolean;
  showDetailButton?: boolean;
  detailButtonUrl?: string;
  detailButtonText?: string;
  order?: number;
}
