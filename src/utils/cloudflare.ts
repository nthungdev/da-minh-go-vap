/**
 * Transforms a Payload media URL or pathname into an optimized Cloudflare Image Resizing URL.
 * Ref: https://developers.cloudflare.com/images/transform-images/transform-via-url
 *
 * @param url - The source image URL, relative pathname, or null/undefined.
 * @param options - Cloudflare image transformation options (e.g. width, height, quality, format).
 * @returns The transformed Cloudflare image URL, original safe URL (for SVGs, external URLs, data URIs), or empty string for invalid inputs.
 */
export function transformUrl(
  url?: string | null,
  options: Record<string, string | number> = {},
): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    return "";
  }

  // Pass through data URIs and blob URIs safely without mangling
  if (trimmedUrl.startsWith("data:") || trimmedUrl.startsWith("blob:")) {
    return trimmedUrl;
  }

  // Pass through SVGs safely without mangling
  const urlWithoutQuery = trimmedUrl.split(/[?#]/)[0] ?? "";
  if (urlWithoutQuery.toLowerCase().endsWith(".svg")) {
    return trimmedUrl;
  }

  const cdnBase = (
    process.env.NEXT_PUBLIC_CDN_URL || "https://cdn.dongdaminhgovap.org"
  ).replace(/\/+$/, "");

  let cdnHost = "cdn.dongdaminhgovap.org";
  try {
    cdnHost = new URL(cdnBase).host.toLowerCase();
  } catch {
    // Fallback if cdnBase is malformed
  }

  let relativePath = trimmedUrl;

  // Check if URL is an absolute URL or protocol-relative URL
  const isAbsolute = /^(?:[a-z]+:)?\/\//i.test(trimmedUrl);
  if (isAbsolute) {
    try {
      const parsed = new URL(
        trimmedUrl.startsWith("//") ? `https:${trimmedUrl}` : trimmedUrl,
      );
      if (parsed.host.toLowerCase() !== cdnHost) {
        // External non-CDN URL: pass through safely without mangling
        return trimmedUrl;
      }
      // Same CDN host: retain full pathname (+ query and hash if present)
      relativePath = parsed.pathname + parsed.search + parsed.hash;
    } catch {
      // In case URL parsing fails for an absolute URL, return as-is
      return trimmedUrl;
    }
  }

  // Strip existing Cloudflare transform prefix if already present
  // e.g. /cdn-cgi/image/width=100,onerror=redirect/media/pic.jpg -> /media/pic.jpg
  const cdnCgiMatch = relativePath.match(/^\/?cdn-cgi\/image\/[^/]+(\/.*)$/);
  if (cdnCgiMatch && cdnCgiMatch[1]) {
    relativePath = cdnCgiMatch[1];
  }

  // Retain full relative pathname without leading slashes for URL concatenation
  const cleanPath = relativePath.replace(/^\/+/, "");
  if (!cleanPath) {
    return "";
  }

  const optionsMap: Record<string, string | number> = {
    onerror: "redirect",
    ...options,
  };

  const optionsString = Object.entries(optionsMap)
    .filter(
      ([, value]) =>
        value !== undefined && value !== null && String(value).trim() !== "",
    )
    .map(([key, value]) => `${key}=${value}`)
    .join(",");

  return `${cdnBase}/cdn-cgi/image/${optionsString}/${cleanPath}`;
}
