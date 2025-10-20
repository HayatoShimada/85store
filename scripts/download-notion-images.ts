// 環境変数を最初に読み込む（他のimportより前）
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import fs, { createWriteStream } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { pipeline } from 'node:stream/promises';
import axios from 'axios';
import sharp from 'sharp';
import ExifTransformer from 'exif-be-gone';
// Notionクライアントは動的にimportする（環境変数読み込み後）

// デバッグ: 環境変数の確認
console.log('Environment check:', {
  NOTION_API_KEY: process.env.NOTION_API_KEY ? 'Set' : 'Not set',
  NOTION_BLOG_DATABASE_ID: process.env.NOTION_BLOG_DATABASE_ID ? 'Set' : 'Not set',
});

const IMAGES_DIR = path.join(process.cwd(), 'public', 'notion-images');

async function downloadImage(url: string, filename: string): Promise<string | null> {
  let res;
  try {
    // astro-notion-blogと同様のaxios実装
    res = await axios({
      method: 'get',
      url: url,
      timeout: 30000, // 30秒タイムアウト
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
  } catch (err) {
    console.error(`Failed to fetch image: ${url}`, err);
    return null;
  }

  if (!res || res.status !== 200) {
    console.error(`Failed to download image: ${url}, status: ${res?.status}`);
    return null;
  }

  const filePath = path.join(IMAGES_DIR, filename);
  const isJpeg = filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.jpeg');

  const writeStream = createWriteStream(filePath);
  const rotate = sharp().rotate();

  let stream = res.data;
  // JPEG画像の場合は、EXIFメタデータを削除しながら自動回転
  if (isJpeg) {
    // ExifTransformerを関数として呼び出す（クラスではない場合）
    if (typeof ExifTransformer === 'function') {
      try {
        const exifTransformer = ExifTransformer.prototype ? new ExifTransformer() : ExifTransformer();
        stream = stream.pipe(exifTransformer).pipe(rotate);
        console.log(`Downloaded: ${filename} (EXIF removed, auto-rotated)`);
      } catch (exifErr) {
        // EXIF処理に失敗した場合は、sharpのみで回転
        stream = res.data.pipe(rotate);
        console.log(`Downloaded: ${filename} (rotated only)`);
      }
    } else {
      stream = res.data.pipe(rotate);
      console.log(`Downloaded: ${filename} (rotated only)`);
    }
  } else {
    console.log(`Downloaded: ${filename}`);
  }

  // ストリームをファイルに書き込み
  try {
    await pipeline(stream, writeStream);
    return `/notion-images/${filename}`;
  } catch (pipeErr) {
    console.error(`Error writing image ${filename}:`, pipeErr);
    return null;
  }
}

function getImageFilename(url: string, postSlug: string, index: number): string {
  const urlHash = crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
  const extension = path.extname(new URL(url).pathname) || '.jpg';
  return `${postSlug}-${index}-${urlHash}${extension}`;
}

async function processBlockImages(blocks: any[], postSlug: string, imageMap: Map<string, string>): Promise<any[]> {
  const processedBlocks = [];
  let imageIndex = 0;

  for (const block of blocks) {
    const processedBlock = { ...block };
    
    if (block.type === 'image') {
      const imageUrl = block.image?.type === 'external' 
        ? block.image.external?.url 
        : block.image?.file?.url;
      
      if (imageUrl && !imageMap.has(imageUrl)) {
        imageIndex++;
        const filename = getImageFilename(imageUrl, postSlug, imageIndex);
        const localPath = await downloadImage(imageUrl, filename);
        
        if (localPath) {
          imageMap.set(imageUrl, localPath);
        }
      }
    }
    
    // 子ブロックも再帰的に処理
    if (block.children && block.children.length > 0) {
      processedBlock.children = await processBlockImages(block.children, postSlug, imageMap);
    }
    
    processedBlocks.push(processedBlock);
  }
  
  return processedBlocks;
}

export async function downloadAllNotionImages() {
  console.log('Starting Notion image download...');

  // 動的にNotionクライアントをimport（環境変数読み込み後）
  const { getBlogPosts, getBlogPost } = await import('../lib/notion.js');

  // 画像保存ディレクトリを作成
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    console.log(`Created directory: ${IMAGES_DIR}`);
  }

  // 画像URLとローカルパスのマッピングを保存
  const imageMapping: Record<string, Record<string, string>> = {};

  try {
    // すべてのブログ記事を取得
    const posts = await getBlogPosts();
    console.log(`Found ${posts.length} blog posts`);

    for (const post of posts) {
      if (!post.slug) continue;
      
      console.log(`Processing post: ${post.title} (${post.slug})`);
      const imageMap = new Map<string, string>();
      
      // カバー画像をダウンロード
      if (post.coverImage) {
        const coverFilename = getImageFilename(post.coverImage, post.slug, 0);
        const localCoverPath = await downloadImage(post.coverImage, coverFilename);
        
        if (localCoverPath) {
          imageMap.set(post.coverImage, localCoverPath);
        }
      }
      
      // 記事本文の画像を処理
      const fullPost = await getBlogPost(post.slug);
      if (fullPost && fullPost.blocks) {
        await processBlockImages(fullPost.blocks, post.slug, imageMap);
      }
      
      // マッピングを保存
      if (imageMap.size > 0) {
        imageMapping[post.slug] = Object.fromEntries(imageMap);
      }
    }

    // マッピングファイルを保存
    const mappingPath = path.join(process.cwd(), 'lib', 'notion-image-mapping.json');
    fs.writeFileSync(mappingPath, JSON.stringify(imageMapping, null, 2));
    console.log(`Image mapping saved to: ${mappingPath}`);

    console.log('Notion image download completed successfully');
    return imageMapping;
  } catch (error) {
    console.error('Error downloading Notion images:', error);
    // エラーが発生してもビルドを継続
    console.warn('Continuing build despite image download failure');
    return {};
  }
}

// スクリプトとして直接実行された場合
// TypeScriptの場合はprocess.argv[1]を使った比較が確実
console.log('Starting Notion image download...');
downloadAllNotionImages()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    // ビルドを継続するためにエラーで終了しない
    process.exit(0);
  });