import crypto from 'crypto';

export function getLocalImagePath(imageUrl: string, postSlug: string, imageIndex: number = 0): string {
  // Generate a consistent hash for the URL
  const urlHash = crypto.createHash('md5').update(imageUrl).digest('hex').substring(0, 8);
  const filename = `${postSlug}-${imageIndex}-${urlHash}.jpg`;
  return `/notion-images/${filename}`;
}

export function isNotionS3Url(url: string): boolean {
  if (!url) return false;
  return (
    url.includes('prod-files-secure.s3.us-west-2.amazonaws.com') ||
    url.includes('s3.us-west-2.amazonaws.com') ||
    url.includes('s3.amazonaws.com')
  );
}