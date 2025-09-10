import { Client } from "@notionhq/client";
import { BlogPost, Product } from "@/types/notion";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

function parseNotionBlogPost(page: unknown): BlogPost {
  const p = page as any;
  const properties = p.properties;
  
  
  // Cover Imageの取得を複数の方法で試行
  let coverImage = "";
  
  // 1. ページのcoverプロパティから取得
  if (p.cover) {
    coverImage = p.cover.file?.url || p.cover.external?.url || "";
    console.log('Cover from page.cover:', coverImage);
  }
  
  // 2. プロパティのCover Imageフィールドから取得（スペース付きプロパティ名）
  if (!coverImage && properties['Cover Image']) {
    if (properties['Cover Image'].files && properties['Cover Image'].files.length > 0) {
      const firstFile = properties['Cover Image'].files[0];
      coverImage = firstFile.file?.url || firstFile.external?.url || "";
    } else if (properties['Cover Image'].url) {
      coverImage = properties['Cover Image'].url;
    }
  }
  
  // 3. プロパティのImageフィールドから取得
  if (!coverImage && properties.Image) {
    if (properties.Image.files && properties.Image.files.length > 0) {
      coverImage = properties.Image.files[0].file?.url || properties.Image.files[0].external?.url || "";
      console.log('Cover from Image property:', coverImage);
    } else if (properties.Image.url) {
      coverImage = properties.Image.url;
      console.log('Cover from Image.url:', coverImage);
    }
  }
  
  
  return {
    id: p.id,
    title: properties.Title?.title?.[0]?.text?.content || "",
    slug: properties.Slug?.rich_text?.[0]?.text?.content || "",
    excerpt: properties.Excerpt?.rich_text?.[0]?.text?.content || "",
    coverImage: coverImage,
    date: properties.Date?.date?.start || "",
    author: properties.Author?.multi_select?.map((author: unknown) => (author as any).name).join(', ') || "",
    authorColors: properties.Author?.multi_select?.map((author: unknown) => (author as any).color) || [],
    category: properties.Category?.multi_select?.map((category: unknown) => (category as any).name).join(', ') || "",
    categoryColors: properties.Category?.multi_select?.map((category: unknown) => (category as any).color) || [],
    tags: properties.Tags?.multi_select?.map((tag: unknown) => (tag as any).name) || [],
    tagColors: properties.Tags?.multi_select?.map((tag: unknown) => (tag as any).color) || [],
    status: properties.Status?.multi_select?.[0]?.name || "",
  };
}

function parseNotionProduct(page: unknown): Product {
  const p = page as any;
  const properties = p.properties;
  return {
    id: p.id,
    name: properties.Name?.title?.[0]?.text?.content || "",
    shopifyHandle: properties.ShopifyHandle?.rich_text?.[0]?.text?.content || "",
    category: properties.Category?.select?.name || "",
    price: properties.Price?.number || 0,
    images: properties.Images?.files?.map((file: unknown) => (file as any).file?.url || (file as any).external?.url) || [],
    description: properties.Description?.rich_text?.[0]?.text?.content || "",
    featured: properties.Featured?.checkbox || false,
    status: properties.Status?.select?.name || "",
    createdAt: p.created_time,
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
        multi_select: {
          contains: "Published",
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

    // 各ページの詳細情報を取得（プロパティを含む）
    const detailedPages = await Promise.all(
      response.results.map(async (page: any) => {
        try {
          const detailedPage = await notion.pages.retrieve({
            page_id: page.id,
          });
          return detailedPage;
        } catch (error) {
          console.error('Error retrieving page details:', error);
          return page;
        }
      })
    );

    const parsedPosts = detailedPages.map(parseNotionBlogPost);
    
    return parsedPosts;
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
  
  // ブロックを再帰的に取得して階層構造を保持する関数
  async function getBlocksWithChildren(blockId: string): Promise<any[]> {
    const blocks = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100,
    });

    const blocksWithChildren = [];
    
    for (const block of blocks.results) {
      const blockWithChildren = { ...block } as any;
      
      // 子ブロックがある場合は再帰的に取得
      if ((block as any).has_children) {
        blockWithChildren.children = await getBlocksWithChildren(block.id);
      }
      
      blocksWithChildren.push(blockWithChildren);
    }
    
    return blocksWithChildren;
  }

  const blocksWithChildren = await getBlocksWithChildren(pageId);

  return {
    page,
    blocks: blocksWithChildren,
  };
}

export async function getProducts(options?: { featured?: boolean; limit?: number }) {
  if (!process.env.NOTION_PRODUCTS_DATABASE_ID || process.env.NOTION_PRODUCTS_DATABASE_ID === 'your_notion_products_database_id_here') {
    console.warn("NOTION_PRODUCTS_DATABASE_ID is not properly configured");
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

export async function getBlogPostsByCategory(category: string, limit?: number) {
  if (!process.env.NOTION_BLOG_DATABASE_ID) {
    console.warn("NOTION_BLOG_DATABASE_ID is not defined");
    return [];
  }

  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_BLOG_DATABASE_ID,
      filter: {
        and: [
          {
            property: "Status",
            multi_select: {
              contains: "Published",
            },
          },
          {
            property: "Category",
            multi_select: {
              contains: category,
            },
          },
        ],
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
    console.error("Error fetching blog posts by category:", error);
    return [];
  }
}

export async function getBlogPostsByTag(tag: string, limit?: number) {
  if (!process.env.NOTION_BLOG_DATABASE_ID) {
    console.warn("NOTION_BLOG_DATABASE_ID is not defined");
    return [];
  }

  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_BLOG_DATABASE_ID,
      filter: {
        and: [
          {
            property: "Status",
            multi_select: {
              contains: "Published",
            },
          },
          {
            property: "Tags",
            multi_select: {
              contains: tag,
            },
          },
        ],
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
    console.error("Error fetching blog posts by tag:", error);
    return [];
  }
}

export async function getAllCategories() {
  if (!process.env.NOTION_BLOG_DATABASE_ID) {
    console.warn("NOTION_BLOG_DATABASE_ID is not defined");
    return [];
  }

  try {
    const database = await notion.databases.retrieve({
      database_id: process.env.NOTION_BLOG_DATABASE_ID,
    });

    const categoryProperty = database.properties.Category;
    
    if (categoryProperty?.type === "multi_select") {
      const categories = categoryProperty.multi_select.options.map((option: unknown) => (option as any).name);
      return categories;
    }
    return [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getAllTags() {
  if (!process.env.NOTION_BLOG_DATABASE_ID) {
    console.warn("NOTION_BLOG_DATABASE_ID is not defined");
    return [];
  }

  try {
    const database = await notion.databases.retrieve({
      database_id: process.env.NOTION_BLOG_DATABASE_ID,
    });

    const tagsProperty = database.properties.Tags;
    if (tagsProperty?.type === "multi_select") {
      return tagsProperty.multi_select.options.map((option: unknown) => (option as any).name);
    }

    return [];
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
}

export async function getRelatedPosts(currentPostId: string, limit: number = 3): Promise<BlogPost[]> {
  if (!process.env.NOTION_BLOG_DATABASE_ID) {
    console.warn("NOTION_BLOG_DATABASE_ID is not defined");
    return [];
  }

  try {
    // 現在の記事の情報を取得
    const currentPost = await notion.pages.retrieve({
      page_id: currentPostId,
    });

    const currentProperties = (currentPost as any).properties;
    const currentCategories = currentProperties.Category?.multi_select?.map((item: any) => item.name) || [];
    const currentTags = currentProperties.Tags?.multi_select?.map((item: any) => item.name) || [];

    // カテゴリまたはタグがない場合は空の配列を返す
    if (currentCategories.length === 0 && currentTags.length === 0) {
      return [];
    }

    // 関連記事を取得（同じカテゴリまたはタグを持つ記事）
    const response = await notion.databases.query({
      database_id: process.env.NOTION_BLOG_DATABASE_ID,
      filter: {
        and: [
          {
            property: "Status",
            multi_select: {
              contains: "Published",
            },
          },
          {
            or: [
              // 同じカテゴリを持つ記事
              ...currentCategories.map((category: string) => ({
                property: "Category",
                multi_select: {
                  contains: category,
                },
              })),
              // 同じタグを持つ記事
              ...currentTags.map((tag: string) => ({
                property: "Tags",
                multi_select: {
                  contains: tag,
                },
              })),
            ],
          },
        ],
      },
      sorts: [
        {
          property: "Date",
          direction: "descending",
        },
      ],
      page_size: limit + 1, // 現在の記事を除外するため1つ多く取得
    });

    // 現在の記事を除外し、各ページの詳細情報を取得
    const relatedPosts = [];
    for (const page of response.results) {
      // 現在の記事を除外
      if (page.id === currentPostId) {
        continue;
      }
      
      const pageDetails = await notion.pages.retrieve({
        page_id: page.id,
      });
      relatedPosts.push(parseNotionBlogPost(pageDetails));
      
      // 指定された件数に達したら終了
      if (relatedPosts.length >= limit) {
        break;
      }
    }

    return relatedPosts;
  } catch (error) {
    console.error("Error fetching related posts:", error);
    return [];
  }
}