import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
  }

  if (!process.env.NOTION_API_KEY || !process.env.NOTION_BLOG_DATABASE_ID) {
    console.error('Missing Notion environment variables');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    // First, find the page by slug
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
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const page = response.results[0];
    const pageId = page.id;
    const properties = (page as any).properties;

    // Get current view count
    const currentViews = properties.Views?.number || 0;
    const newViews = currentViews + 1;

    // Update the view count
    await notion.pages.update({
      page_id: pageId,
      properties: {
        Views: {
          number: newViews,
        },
      },
    });

    return NextResponse.json({
      success: true,
      views: newViews,
      message: `View count updated to ${newViews}`
    });
  } catch (error: any) {
    console.error('Error updating view count:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to update view count',
        details: error.code || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
  }

  if (!process.env.NOTION_API_KEY || !process.env.NOTION_BLOG_DATABASE_ID) {
    console.error('Missing Notion environment variables');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    // Find the page by slug
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
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const page = response.results[0];
    const properties = (page as any).properties;
    const views = properties.Views?.number || 0;

    return NextResponse.json({
      views,
      slug
    });
  } catch (error: any) {
    console.error('Error fetching view count:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch view count',
        details: error.code || 'Unknown error'
      },
      { status: 500 }
    );
  }
}