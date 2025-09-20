import fs, { createWriteStream } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { pipeline } from 'node:stream/promises';
import axios from 'axios';
import sharp from 'sharp';
import ExifTransformer from 'exif-be-gone';
import dotenv from 'dotenv';
import { getBlogPosts } from '../lib/notion';

// Load environment variables
dotenv.config({ path: '.env.local' });

const IMAGES_DIR = path.join(process.cwd(), 'public', 'notion-images');

async function downloadImage(url: string, filename: string): Promise<string | null> {
  let res;
  try {
    console.log(`Downloading: ${filename}`);
    
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
    try {
      stream = stream.pipe(new ExifTransformer()).pipe(rotate);
      console.log(`✓ Downloaded: ${filename} (EXIF removed, auto-rotated)`);
    } catch (exifErr) {
      console.warn(`Warning: Could not process EXIF for ${filename}:`, exifErr);
      stream = res.data.pipe(rotate);
      console.log(`✓ Downloaded: ${filename} (rotated only)`);
    }
  } else {
    console.log(`✓ Downloaded: ${filename}`);
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
  const extension = '.jpg'; // Default to jpg
  return `${postSlug}-${index}-${urlHash}${extension}`;
}

export async function downloadAllNotionImages() {
  console.log('Starting Notion image download (simplified version)...');

  // Create image directory
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    console.log(`Created directory: ${IMAGES_DIR}`);
  }

  // Image mapping to save
  const imageMapping: Record<string, Record<string, string>> = {};

  try {
    // Get all blog posts
    const posts = await getBlogPosts();
    console.log(`Found ${posts.length} blog posts`);

    for (const post of posts) {
      if (!post.slug) continue;

      console.log(`\nProcessing post: ${post.title} (${post.slug})`);
      const imageMap = new Map<string, string>();

      // Download cover image
      if (post.coverImage) {
        const coverFilename = getImageFilename(post.coverImage, post.slug, 0);
        const localCoverPath = await downloadImage(post.coverImage, coverFilename);

        if (localCoverPath) {
          imageMap.set(post.coverImage, localCoverPath);
        }
      }

      // Save mapping for this post
      if (imageMap.size > 0) {
        imageMapping[post.slug] = Object.fromEntries(imageMap);
      }
    }

    // Save mapping file
    const mappingPath = path.join(process.cwd(), 'lib', 'notion-image-mapping.json');
    fs.writeFileSync(mappingPath, JSON.stringify(imageMapping, null, 2));
    console.log(`\nImage mapping saved to: ${mappingPath}`);

    console.log('\n✅ Notion image download completed successfully');
    return imageMapping;
  } catch (error) {
    console.error('Error downloading Notion images:', error);
    console.warn('Continuing build despite image download failure');
    return {};
  }
}

// Run if executed directly
// TypeScriptの場合はprocess.argv[1]を使った比較が確実
console.log('Starting Notion image download (simplified version)...');
downloadAllNotionImages()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(0);
  });