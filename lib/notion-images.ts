import fs from 'fs';
import path from 'path';

let imageMapping: Record<string, Record<string, string>> | null = null;

function loadImageMapping(): Record<string, Record<string, string>> {
  if (imageMapping) return imageMapping;
  
  try {
    const mappingPath = path.join(process.cwd(), 'lib', 'notion-image-mapping.json');
    if (fs.existsSync(mappingPath)) {
      const content = fs.readFileSync(mappingPath, 'utf-8');
      imageMapping = JSON.parse(content);
      return imageMapping || {};
    }
  } catch (error) {
    console.error('Error loading image mapping:', error);
  }
  
  return {};
}

export function getLocalImageUrl(originalUrl: string, postSlug?: string): string {
  const mapping = loadImageMapping();
  
  // 記事ごとのマッピングを確認
  if (postSlug && mapping[postSlug]) {
    const localUrl = mapping[postSlug][originalUrl];
    if (localUrl) return localUrl;
  }
  
  // 全記事を検索
  for (const slug in mapping) {
    const localUrl = mapping[slug][originalUrl];
    if (localUrl) return localUrl;
  }
  
  // マッピングが見つからない場合は元のURLを返す
  return originalUrl;
}

export function processImageUrls(data: any, postSlug?: string): any {
  if (!data) return data;
  
  if (typeof data === 'string') {
    // NotionのAWS S3画像URLかチェック
    if (data.includes('prod-files-secure.s3') || 
        data.includes('s3.us-west-2.amazonaws.com') ||
        data.includes('s3.amazonaws.com')) {
      return getLocalImageUrl(data, postSlug);
    }
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => processImageUrls(item, postSlug));
  }
  
  if (typeof data === 'object') {
    const processed: any = {};
    for (const key in data) {
      processed[key] = processImageUrls(data[key], postSlug);
    }
    return processed;
  }
  
  return data;
}