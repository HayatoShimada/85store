import { Client } from "@notionhq/client";
import { BlogPost, Product, NotionPage } from "@/types/notion";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

function parseNotionBlogPost(page: any): BlogPost {
  const properties = page.properties;
  return {
    id: page.id,
    title: properties.Title?.title?.[0]?.plain_text || "",
    slug: properties.Slug?.rich_text?.[0]?.plain_text || "",
    excerpt: properties.Excerpt?.rich_text?.[0]?.plain_text || "",
    coverImage: page.cover?.file?.url || page.cover?.external?.url || "",
    date: properties.Date?.date?.start || "",
    author: properties.Author?.select?.name || "",
    category: properties.Category?.select?.name || "",
    tags: properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
    status: properties.Status?.select?.name || "",
  };
}

function parseNotionProduct(page: any): Product {
  const properties = page.properties;
  return {
    id: page.id,
    name: properties.Name?.title?.[0]?.plain_text || "",
    shopifyHandle: properties.ShopifyHandle?.rich_text?.[0]?.plain_text || "",
    category: properties.Category?.select?.name || "",
    price: properties.Price?.number || 0,
    images: properties.Images?.files?.map((file: any) => file.file?.url || file.external?.url) || [],
    description: properties.Description?.rich_text?.[0]?.plain_text || "",
    featured: properties.Featured?.checkbox || false,
    status: properties.Status?.select?.name || "",
    createdAt: page.created_time,
  };
}

export async function getBlogPosts(limit?: number) {
  if (!process.env.NOTION_BLOG_DATABASE_ID) {
    console.warn("NOTION_BLOG_DATABASE_ID is not defined");
    return [];
  }

  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_BLOG_DATABASE_ID,
      filter: {
        property: "Status",
        select: {
          equals: "Published",
        },
      },
      sorts: [
        {
          property: "Date",
          direction: "descending",
        },
      ],
      page_size: limit || 100,
    });

    return response.results.map(parseNotionBlogPost);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

export async function getBlogPost(slug: string) {
  if (!process.env.NOTION_BLOG_DATABASE_ID) {
    throw new Error("NOTION_BLOG_DATABASE_ID is not defined");
  }

  const response = await notion.databases.query({
    database_id: process.env.NOTION_BLOG_DATABASE_ID,
    filter: {
      property: "Slug",
      rich_text: {
        equals: slug,
      },
    },
  });

  if (response.results.length === 0) {
    return null;
  }

  const page = response.results[0];
  const pageId = page.id;
  const blocks = await notion.blocks.children.list({
    block_id: pageId,
  });

  return {
    page,
    blocks: blocks.results,
  };
}

export async function getProducts(options?: { featured?: boolean; limit?: number }) {
  if (!process.env.NOTION_PRODUCTS_DATABASE_ID) {
    console.warn("NOTION_PRODUCTS_DATABASE_ID is not defined");
    return [];
  }

  try {
    const filters: any = {
      and: [
        {
          property: "Status",
          select: {
            equals: "Active",
          },
        },
      ],
    };

    if (options?.featured) {
      filters.and.push({
        property: "Featured",
        checkbox: {
          equals: true,
        },
      });
    }

    const response = await notion.databases.query({
      database_id: process.env.NOTION_PRODUCTS_DATABASE_ID,
      filter: filters,
      sorts: [
        {
          property: "CreatedTime",
          direction: "descending",
        },
      ],
      page_size: options?.limit || 100,
    });

    return response.results.map(parseNotionProduct);
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getFeaturedProducts(limit: number = 4) {
  return getProducts({ featured: true, limit });
}

export async function getLatestProducts(limit: number = 4) {
  return getProducts({ limit });
}