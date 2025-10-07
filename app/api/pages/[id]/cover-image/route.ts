import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: pageId } = await params;

  if (!pageId) {
    return NextResponse.json({ error: 'Page ID is required' }, { status: 400 });
  }

  if (!process.env.NOTION_API_KEY) {
    console.error('NOTION_API_KEY is not set');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    console.log('Fetching Cover Image property for page ID:', pageId);

    // Notion APIからページ情報を取得
    const page = await notion.pages.retrieve({
      page_id: pageId,
    }) as any;

    console.log('Retrieved page:', page.id);

    const properties = page.properties;
    let imageUrl: string | undefined;
    let expiryTime: string | undefined;

    // Cover Imageプロパティから取得
    if (properties['Cover Image']) {
      if (properties['Cover Image'].files && properties['Cover Image'].files.length > 0) {
        const firstFile = properties['Cover Image'].files[0];
        imageUrl = firstFile.file?.url || firstFile.external?.url;

        if (firstFile.file?.url) {
          // URLから期限情報を抽出
          const urlParams = new URLSearchParams(imageUrl!.split('?')[1]);
          const expires = urlParams.get('X-Amz-Expires');
          const date = urlParams.get('X-Amz-Date');

          if (expires && date) {
            // AWS S3の日付フォーマットをパース
            const year = date.substring(0, 4);
            const month = date.substring(4, 6);
            const day = date.substring(6, 8);
            const hour = date.substring(9, 11);
            const minute = date.substring(11, 13);
            const second = date.substring(13, 15);

            const startDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
            const expiryDate = new Date(startDate.getTime() + parseInt(expires) * 1000);
            expiryTime = expiryDate.toISOString();
          }
        }
      } else if (properties['Cover Image'].url) {
        imageUrl = properties['Cover Image'].url;
      }
    }

    // ページのcoverプロパティもチェック
    if (!imageUrl && page.cover) {
      const cover = page.cover;

      if (cover.type === 'file' && cover.file) {
        imageUrl = cover.file.url;

        // URLから期限情報を抽出
        const urlParams = new URLSearchParams(imageUrl.split('?')[1]);
        const expires = urlParams.get('X-Amz-Expires');
        const date = urlParams.get('X-Amz-Date');

        if (expires && date) {
          const year = date.substring(0, 4);
          const month = date.substring(4, 6);
          const day = date.substring(6, 8);
          const hour = date.substring(9, 11);
          const minute = date.substring(11, 13);
          const second = date.substring(13, 15);

          const startDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
          const expiryDate = new Date(startDate.getTime() + parseInt(expires) * 1000);
          expiryTime = expiryDate.toISOString();
        }
      } else if (cover.type === 'external' && cover.external) {
        imageUrl = cover.external.url;
      }
    }

    if (imageUrl) {
      // easy-notion-blogと同じ形式で返す
      const response = {
        Id: pageId,
        Type: 'image',
        Image: {
          Caption: [],
          Type: expiryTime ? 'file' : 'external',
          External: !expiryTime ? {
            Url: imageUrl
          } : null,
          File: expiryTime ? {
            Url: imageUrl,
            ExpiryTime: expiryTime
          } : null
        }
      };

      return NextResponse.json(response);
    }

    return NextResponse.json({ error: 'Page does not have a Cover Image' }, { status: 404 });
  } catch (error: any) {
    console.error('Error fetching Cover Image:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch Cover Image' },
      { status: 500 }
    );
  }
}
