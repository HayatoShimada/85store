import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import ExifTransformer from 'exif-be-gone';
import { getBlogPosts, getBlogPost } from '../lib/notion';

const IMAGES_DIR = path.join(process.cwd(), 'public', 'notion-images');

async function downloadImage(url: string, filename: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error(`Failed to download image: ${url}, status: ${response.status}`);
      return null;
    }

    const filePath = path.join(IMAGES_DIR, filename);
    const isJpeg = filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.jpeg');
    
    // Stream the response body through EXIF removal
    const chunks: Buffer[] = [];
    const exifTransformer = new ExifTransformer();
    
    // Get the response body as a readable stream
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    // Process the stream
    const processStream = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = Buffer.from(value);
        exifTransformer.write(chunk);
      }
      exifTransformer.end();
    };

    // Collect transformed data
    exifTransformer.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    await new Promise<void>((resolve, reject) => {
      exifTransformer.on('end', resolve);
      exifTransformer.on('error', reject);
      processStream().catch(reject);
    });

    let buffer = Buffer.concat(chunks);

    // For JPEG images, ensure proper rotation using sharp
    if (isJpeg) {
      try {
        buffer = Buffer.from(await sharp(buffer).rotate().toBuffer());
      } catch (sharpError) {
        console.warn(`Warning: Could not rotate image ${filename}:`, sharpError);
        // Continue with original buffer if rotation fails
      }
    }
    
    fs.writeFileSync(filePath, buffer);
    console.log(`Downloaded: ${filename} (EXIF removed${isJpeg ? ', rotated' : ''})`);
    
    return `/notion-images/${filename}`;
  } catch (error) {
    console.error(`Error downloading image ${url}:`, error);
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
    throw error;
  }
}

// スクリプトとして直接実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
  downloadAllNotionImages()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}