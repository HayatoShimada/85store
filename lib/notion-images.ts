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

// URLからベース部分（クエリパラメータを除く）を抽出
function getUrlBase(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.origin}${urlObj.pathname}`;
  } catch {
    return url;
  }
}

export function getLocalImageUrl(originalUrl: string, postSlug?: string): string {
  if (!originalUrl) return originalUrl;

  const mapping = loadImageMapping();
  const originalUrlBase = getUrlBase(originalUrl);

  // 記事ごとのマッピングを確認
  if (postSlug && mapping[postSlug]) {
    // 完全一致を試す
    if (mapping[postSlug][originalUrl]) {
      return mapping[postSlug][originalUrl];
    }

    // ベースURL（クエリパラメータなし）で比較
    for (const [mappedUrl, localPath] of Object.entries(mapping[postSlug])) {
      if (getUrlBase(mappedUrl) === originalUrlBase) {
        return localPath;
      }
    }
  }

  // 全記事を検索
  for (const slug in mapping) {
    // 完全一致を試す
    if (mapping[slug][originalUrl]) {
      return mapping[slug][originalUrl];
    }

    // ベースURL（クエリパラメータなし）で比較
    for (const [mappedUrl, localPath] of Object.entries(mapping[slug])) {
      if (getUrlBase(mappedUrl) === originalUrlBase) {
        return localPath;
      }
    }
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