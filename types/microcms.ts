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
