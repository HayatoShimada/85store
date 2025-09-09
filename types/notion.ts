export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  status: string;
}

export interface Product {
  id: string;
  name: string;
  shopifyHandle: string;
  category: string;
  price: number;
  images: string[];
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