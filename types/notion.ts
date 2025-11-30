export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  coverImageExpiryTime?: string;
  coverImageBlockId?: string;
  date: string;
  author: string;
  authorColors: string[];
  category: string;
  categoryColors: string[];
  tags: string[];
  tagColors: string[];
  status: string;
  views?: number;
  featured: boolean;
}

export interface Product {
  id: string;
  name: string;
  shopifyHandle: string;
  category: string;
  price: number;
  images: string[];
  imageExpiryTime?: string;
  imageBlockId?: string;
  description: string;
  featured: boolean;
  status: string;
  createdAt: string;
}

export interface NotionPageProperty {
  id: string;
  type: string;
  [key: string]: any;
}

export interface NotionPage {
  id: string;
  properties: Record<string, NotionPageProperty>;
  cover?: {
    type: string;
    external?: { url: string };
    file?: { url: string };
  };
}