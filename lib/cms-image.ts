// srcset（"url 480w, url 800w, …"）から、いちばん大きい画像の URL
export function largestFromSrcset(srcset: string | undefined): string | undefined {
  if (!srcset) return undefined;
  const entries = srcset.split(",").map((entry) => entry.trim().split(/\s+/));
  return entries.sort((a, b) => parseInt(b[1]) - parseInt(a[1]))[0]?.[0];
}
