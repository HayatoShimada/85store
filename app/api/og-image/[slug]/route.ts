import { NextRequest, NextResponse } from 'next/server';
import { getBlogPost } from '@/lib/notion';
import path from 'path';
import fs from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return new NextResponse('Missing slug parameter', { status: 400 });
    }

    console.log('========== OG Image API Request ==========');
    console.log('Slug:', slug);

    // 記事を取得
    const postData = await getBlogPost(slug);
    
    if (!postData) {
      console.log('Post not found for slug:', slug);
      return new NextResponse('Post not found', { status: 404 });
    }

    const { page } = postData;
    const post = page as any;

    // カバー画像のURLを取得
    let coverImageUrl = '';
    
    // 1. ページのcoverプロパティから取得
    if (post.cover) {
      coverImageUrl = post.cover.file?.url || post.cover.external?.url || '';
      console.log('Cover from page.cover:', coverImageUrl);
    }
    
    // 2. プロパティのCover Imageフィールドから取得
    if (!coverImageUrl && post.properties?.['Cover Image']) {
      if (post.properties['Cover Image'].files && post.properties['Cover Image'].files.length > 0) {
        const firstFile = post.properties['Cover Image'].files[0];
        coverImageUrl = firstFile.file?.url || firstFile.external?.url || '';
      } else if (post.properties['Cover Image'].url) {
        coverImageUrl = post.properties['Cover Image'].url;
      }
    }
    
    // 3. プロパティのImageフィールドから取得
    if (!coverImageUrl && post.properties?.Image) {
      if (post.properties.Image.files && post.properties.Image.files.length > 0) {
        coverImageUrl = post.properties.Image.files[0].file?.url || post.properties.Image.files[0].external?.url || '';
        console.log('Cover from Image property:', coverImageUrl);
      } else if (post.properties.Image.url) {
        coverImageUrl = post.properties.Image.url;
        console.log('Cover from Image.url:', coverImageUrl);
      }
    }

    if (!coverImageUrl) {
      console.log('No cover image found for post:', slug);
      return new NextResponse('No cover image found', { status: 404 });
    }

    console.log('Fetching OG image from:', coverImageUrl);

    // 画像を取得
    const imageResponse = await fetch(coverImageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!imageResponse.ok) {
      console.log('Failed to fetch image:', imageResponse.status);
      
      // 画像が取得できない場合はプレースホルダー画像を返す
      try {
        const placeholderPath = path.join(process.cwd(), 'public', 'images', 'placeholder.svg');
        const placeholderBuffer = await fs.promises.readFile(placeholderPath);
        
        return new NextResponse(placeholderBuffer as any, {
          status: 200,
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, s-maxage=3600, max-age=3600', // 1時間キャッシュ
            'Content-Length': placeholderBuffer.length.toString(),
          },
        });
      } catch (placeholderError) {
        console.error('Failed to load placeholder image:', placeholderError);
        return new NextResponse('Failed to fetch image', { status: imageResponse.status });
      }
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    console.log('Successfully fetched OG image, size:', imageBuffer.byteLength, 'bytes');

    // レスポンスを返す（CDNキャッシュを設定）
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, s-maxage=86400, max-age=86400, stale-while-revalidate=86400', // 24時間キャッシュ
        'Content-Length': imageBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Error in OG image API:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal server error',
      { status: 500 }
    );
  }
}
