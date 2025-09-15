import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import crypto from 'crypto';

// キャッシュマップ（URLのリフレッシュを管理）
const urlRefreshCache = new Map<string, { url: string; expiry: number }>();

// Notion APIクライアント
const notion = process.env.NOTION_API_KEY ? new Client({
  auth: process.env.NOTION_API_KEY,
}) : null;

// URLからブロックIDを抽出
function extractBlockIdFromUrl(url: string): string | null {
  // Notion S3 URLパターンから抽出
  const patterns = [
    /\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\//, // UUID形式
    /secure\.notion-static\.com\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/, // notion-static
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

// キャッシュキーを生成
function getCacheKey(url: string): string {
  // URLからクエリパラメータを除去してキーを生成
  const baseUrl = url.split('?')[0];
  return crypto.createHash('md5').update(baseUrl).digest('hex');
}

// Notion APIから新しいURLを取得
async function refreshNotionImageUrl(originalUrl: string): Promise<string | null> {
  try {
    if (!notion) {
      console.log('Notion API client not initialized');
      return null;
    }
    
    const blockId = extractBlockIdFromUrl(originalUrl);
    if (!blockId) {
      console.log('Could not extract block ID from URL:', originalUrl);
      return null;
    }

    // ブロック情報を取得
    const block = await notion.blocks.retrieve({ block_id: blockId });
    
    // 画像ブロックの場合
    if ('type' in block && block.type === 'image' && 'image' in block) {
      const imageBlock = block.image;
      if (imageBlock.type === 'file' && imageBlock.file?.url) {
        return imageBlock.file.url;
      } else if (imageBlock.type === 'external' && imageBlock.external?.url) {
        return imageBlock.external.url;
      }
    }
    
    // ファイルブロックの場合
    if ('type' in block && block.type === 'file' && 'file' in block) {
      const fileBlock = block.file;
      if (fileBlock.type === 'file' && fileBlock.file?.url) {
        return fileBlock.file.url;
      } else if (fileBlock.type === 'external' && fileBlock.external?.url) {
        return fileBlock.external.url;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error refreshing Notion image URL:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing image URL', { status: 400 });
  }

  try {
    let targetUrl = imageUrl;
    const cacheKey = getCacheKey(imageUrl);
    const now = Date.now();
    
    // キャッシュから有効なURLを取得
    const cached = urlRefreshCache.get(cacheKey);
    if (cached && cached.expiry > now) {
      targetUrl = cached.url;
    }
    
    // 画像を取得
    let response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    // URLが期限切れの場合、新しいURLを取得してリトライ
    if (!response.ok && (response.status === 403 || response.status === 404)) {
      console.log(`Image URL expired (${response.status}), attempting to refresh...`);
      
      const newUrl = await refreshNotionImageUrl(imageUrl);
      if (newUrl && newUrl !== targetUrl) {
        // 新しいURLをキャッシュ（50分間有効）
        urlRefreshCache.set(cacheKey, {
          url: newUrl,
          expiry: now + 50 * 60 * 1000, // 50分
        });
        
        // 新しいURLで再試行
        response = await fetch(newUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });
      }
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=2592000, stale-while-revalidate=86400', // 30日キャッシュ、1日はstale-while-revalidate
      },
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    return new NextResponse('Failed to fetch image', { status: 500 });
  }
}
