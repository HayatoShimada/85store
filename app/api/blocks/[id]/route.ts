import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const blockId = params.id;

  if (!blockId) {
    return NextResponse.json({ error: 'Block ID is required' }, { status: 400 });
  }

  try {
    console.log('Fetching block:', blockId);

    // Notion APIからブロック情報を取得
    const block = await notion.blocks.retrieve({
      block_id: blockId,
    });

    console.log('Retrieved block:', JSON.stringify(block, null, 2));

    // ブロックが画像タイプかチェック
    if ('type' in block && block.type === 'image' && 'image' in block) {
      const imageBlock = block.image;

      let imageUrl: string | undefined;
      let expiryTime: string | undefined;

      if (imageBlock.type === 'file' && imageBlock.file) {
        imageUrl = imageBlock.file.url;
        // URLから期限情報を抽出
        const urlParams = new URLSearchParams(imageUrl.split('?')[1]);
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
      } else if (imageBlock.type === 'external' && imageBlock.external) {
        imageUrl = imageBlock.external.url;
      }

      // easy-notion-blogと同じ形式で返す
      const response = {
        Id: blockId,
        Type: 'image',
        Image: {
          Caption: [],
          Type: imageBlock.type,
          External: imageBlock.type === 'external' ? {
            Url: imageUrl
          } : null,
          File: imageBlock.type === 'file' ? {
            Url: imageUrl,
            ExpiryTime: expiryTime
          } : null
        }
      };

      return NextResponse.json(response);
    }

    return NextResponse.json({ error: 'Block is not an image' }, { status: 404 });
  } catch (error: any) {
    console.error('Error fetching block:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch block' },
      { status: 500 }
    );
  }
}