import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import dotenv from 'dotenv';
import { getBlogPosts } from '../lib/notion';

// Load environment variables
dotenv.config({ path: '.env.local' });

const IMAGES_DIR = path.join(process.cwd(), 'public', 'notion-images');

async function downloadImage(url: string, filename: string): Promise<string | null> {
  try {
    console.log(`Downloading: ${filename}`);

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

    // Get image data
    const buffer = Buffer.from(await response.arrayBuffer());

    // For JPEG images, use sharp to remove EXIF and ensure proper rotation
    let processedBuffer: Buffer = buffer;
    if (isJpeg) {
      try {
        processedBuffer = await sharp(buffer)
          .rotate() // Auto-rotate based on EXIF orientation
          .withMetadata({
            // Remove EXIF data but keep basic metadata
            exif: {},
            orientation: undefined
          })
          .toBuffer();
        console.log(`✓ Downloaded: ${filename} (EXIF removed, rotated)`);
      } catch (sharpError) {
        console.warn(`Warning: Could not process image ${filename}:`, sharpError);
        console.log(`✓ Downloaded: ${filename} (original)`);
      }
    } else {
      console.log(`✓ Downloaded: ${filename}`);
    }

    fs.writeFileSync(filePath, processedBuffer);
    return `/notion-images/${filename}`;
  } catch (error) {
    console.error(`Error downloading image ${url}:`, error);
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
if (import.meta.url === `file://${process.argv[1]}`) {
  downloadAllNotionImages()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(0);
    });
}