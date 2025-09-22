import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// キャッシュマップ（URLのリフレッシュを管理）
const urlRefreshCache = new Map<string, { url: string; expiry: number }>();

// Notion APIクライアント
const notion = process.env.NOTION_API_KEY ? new Client({
  auth: process.env.NOTION_API_KEY,
}) : null;

console.log('Notion API client initialized:', notion ? 'Yes' : 'No');
console.log('NOTION_API_KEY available:', process.env.NOTION_API_KEY ? 'Yes' : 'No');

// URLからブロックIDを抽出
function extractBlockIdFromUrl(url: string): string | null {
  // Notion S3 URLパターンから抽出
  // URLは通常以下のような形式:
  // https://prod-files-secure.s3.us-west-2.amazonaws.com/{workspace-id}/{block-id}/{filename}
  // ブロックIDは2番目のUUIDを使う

  const uuidPattern = /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/g;
  const matches = url.match(uuidPattern);

  if (matches && matches.length >= 2) {
    // 2番目のUUID（ブロックID）を返す
    console.log('Found block ID from URL:', matches[1]);
    return matches[1];
  } else if (matches && matches.length === 1) {
    // 1つしかない場合は、それを使用
    console.log('Found single UUID, using as block ID:', matches[0]);
    return matches[0];
  }

  console.log('No UUID found in URL:', url);
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
      console.log('Notion API client not initialized - check NOTION_API_KEY env variable');
      return null;
    }

    const blockId = extractBlockIdFromUrl(originalUrl);
    if (!blockId) {
      console.log('Could not extract block ID from URL:', originalUrl);
      return null;
    }

    console.log('Attempting to refresh URL for block:', blockId);

    // ブロック情報を取得
    const block = await notion.blocks.retrieve({ block_id: blockId });
    console.log('Retrieved block type:', (block as any).type);
    console.log('Block data:', JSON.stringify(block, null, 2));

    // 画像ブロックの場合
    if ('type' in block && block.type === 'image' && 'image' in block) {
      const imageBlock = block.image;
      if (imageBlock.type === 'file' && imageBlock.file?.url) {
        console.log('Found new image URL from block');
        return imageBlock.file.url;
      } else if (imageBlock.type === 'external' && imageBlock.external?.url) {
        console.log('Found external image URL from block');
        return imageBlock.external.url;
      }
    }

    // ファイルブロックの場合
    if ('type' in block && block.type === 'file' && 'file' in block) {
      const fileBlock = block.file;
      if (fileBlock.type === 'file' && fileBlock.file?.url) {
        console.log('Found new file URL from block');
        return fileBlock.file.url;
      } else if (fileBlock.type === 'external' && fileBlock.external?.url) {
        console.log('Found external file URL from block');
        return fileBlock.external.url;
      }
    }

    console.log('Block type not supported for refresh:', (block as any).type);
    return null;
  } catch (error: any) {
    console.error('Error refreshing Notion image URL:', {
      message: error.message,
      code: error.code,
      status: error.status,
    });
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');
  const refreshOnly = searchParams.get('refresh') === 'true';

  if (!imageUrl) {
    console.error('Missing image URL parameter');
    return new NextResponse('Missing image URL', { status: 400 });
  }

  // URLはすでにsearchParams.get()によってデコードされているので、そのまま使用
  const decodedUrl = imageUrl;

  console.log('========== Image Proxy Request ==========');
  console.log('Original URL (encoded):', imageUrl.substring(0, 100) + '...');
  console.log('Decoded URL:', decodedUrl.substring(0, 100) + '...');
  console.log('Notion API available:', notion ? 'Yes' : 'No');
  console.log('Refresh only mode:', refreshOnly);

  try {
    let targetUrl = decodedUrl;
    const cacheKey = getCacheKey(decodedUrl);
    const now = Date.now();
    
    // キャッシュから有効なURLを取得
    const cached = urlRefreshCache.get(cacheKey);
    if (cached && cached.expiry > now) {
      targetUrl = cached.url;
    }
    
    // 画像を取得
    console.log('Fetching image from:', targetUrl);
    let response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    console.log('Response status:', response.status);

    // URLが期限切れの場合、新しいURLを取得してリトライ
    // 400: Bad Request (invalid signature), 403: Forbidden, 404: Not Found
    if (!response.ok && (response.status === 400 || response.status === 403 || response.status === 404)) {
      console.log(`Image URL expired or invalid (${response.status}), attempting to refresh...`);
      
      const newUrl = await refreshNotionImageUrl(decodedUrl);
      console.log('Refresh result:', newUrl ? 'Success - got new URL' : 'Failed - no new URL');
      
      if (newUrl && newUrl !== targetUrl) {
        console.log('Using refreshed URL for retry');
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
        console.log('Retry response status:', response.status);
      } else {
        console.log('No new URL available, will return placeholder');
      }
    }

    if (!response.ok) {
      // refreshOnlyモードの場合は、期限情報のみを返す
      if (refreshOnly) {
        return new NextResponse(JSON.stringify({ 
          error: 'Image not accessible',
          status: response.status 
        }), {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      
      // 画像が取得できない場合はプレースホルダー画像を返す
      console.log(`Image fetch failed with status ${response.status}, returning placeholder`);
      const placeholderPath = path.join(process.cwd(), 'public', 'images', 'placeholder.svg');
      
      try {
        const placeholderBuffer = await fs.promises.readFile(placeholderPath);
        return new NextResponse(Buffer.from(placeholderBuffer), {
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      } catch (fileErr) {
        console.error('Failed to load placeholder image:', fileErr);
        // プレースホルダーも読めない場合は404を返す
        return new NextResponse('Image not found', { status: 404 });
      }
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    const responseHeaders: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=2592000, stale-while-revalidate=86400', // 30日キャッシュ、1日はstale-while-revalidate
    };

    // 新しいURLが取得された場合は、期限情報とブロックIDをヘッダーに追加
    if (targetUrl !== decodedUrl) {
      responseHeaders['x-refreshed-url'] = targetUrl;
      const blockId = extractBlockIdFromUrl(decodedUrl);
      if (blockId) {
        responseHeaders['x-block-id'] = blockId;
      }
      
      // URLから期限情報を抽出（X-Amz-Expiresパラメータから）
      const urlParams = new URLSearchParams(targetUrl.split('?')[1]);
      const expires = urlParams.get('X-Amz-Expires');
      const date = urlParams.get('X-Amz-Date');
      if (expires && date) {
        const expiryTime = new Date(Date.parse(date) + parseInt(expires) * 1000).toISOString();
        responseHeaders['x-expiry-time'] = expiryTime;
      }
    }

    return new NextResponse(imageBuffer, {
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      url: decodedUrl,
    });
    return new NextResponse(
      error instanceof Error ? error.message : 'Failed to fetch image',
      { status: 500 }
    );
  }
}
