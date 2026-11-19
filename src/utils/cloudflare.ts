const CONFIGURED_MEDIA_CDN_URL = process.env.NEXT_PUBLIC_MEDIA_CDN_URL;

/** Path Payload uses to stream uploaded files from storage through the app server. */
const PAYLOAD_MEDIA_FILE_PATH = "/api/media/file/";

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

  let cdnBase = (
    process.env.NEXT_PUBLIC_CDN_URL ||
    process.env.NEXT_PUBLIC_MEDIA_CDN_URL ||
    "https://cdn.dongdaminhgovap.org"
  ).replace(/\/+$/, "");

  let cdnHost = "cdn.dongdaminhgovap.org";
  try {
    cdnHost = new URL(cdnBase).host.toLowerCase();
  } catch {
    // Fallback if cdnBase is malformed
    cdnBase = "https://cdn.dongdaminhgovap.org";
    cdnHost = "cdn.dongdaminhgovap.org";
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

  // Separate pathname from query/hash so regexes and prefix checks don't match query params
  const suffixIndex = relativePath.search(/[?#]/);
  let pathname =
    suffixIndex === -1 ? relativePath : relativePath.slice(0, suffixIndex);
  const suffix = suffixIndex === -1 ? "" : relativePath.slice(suffixIndex);

  // Strip existing Cloudflare transform prefix if already present
  // e.g. /cdn-cgi/image/width=100,onerror=redirect/media/pic.jpg -> /media/pic.jpg
  const cdnCgiMatch = pathname.match(/^\/?cdn-cgi\/image\/[^/]+(\/.*)$/);
  if (cdnCgiMatch && cdnCgiMatch[1]) {
    pathname = cdnCgiMatch[1];
  }

  // Strip Payload media proxy prefix so proxied URLs map to the same CDN key
  if (pathname.startsWith(PAYLOAD_MEDIA_FILE_PATH)) {
    pathname = pathname.slice(PAYLOAD_MEDIA_FILE_PATH.length);
  }

  // Retain full relative pathname without leading slashes for URL concatenation
  const cleanPath = pathname.replace(/^\/+/, "");
  if (!cleanPath) {
    return "";
  }

  const optionsMap: Record<string, string | number> = {
    format: "auto",
    quality: "85",
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

  return `${cdnBase}/cdn-cgi/image/${optionsString}/${cleanPath}${suffix}`;
}

/**
 * Rewrites a Payload-proxied media URL (`/api/media/file/<name>`) to the media CDN origin.
 * Other values are returned unchanged.
 * Without `NEXT_PUBLIC_MEDIA_CDN_URL` (e.g. local dev) the URL is kept, so media that only
 * exists in a local or staging bucket still loads through Payload instead of 404ing on the
 * production CDN.
 */
export function toCdnMediaUrl(url: string): string {
  if (!CONFIGURED_MEDIA_CDN_URL) return url;
  if (!url.startsWith(PAYLOAD_MEDIA_FILE_PATH)) return url;
  return `${CONFIGURED_MEDIA_CDN_URL}/${url.slice(PAYLOAD_MEDIA_FILE_PATH.length)}`;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Deep-copies Payload data for public rendering, pointing every media URL at the CDN
 * so pages never reference (or serialize) `/api/media/file/` URLs.
 * Only strings that start with the Payload file path are rewritten; free text such as
 * markdown bodies is left as-is. Expects Payload Local API output, which is plain JSON
 * (ids and dates are strings); other class instances are returned by reference.
 */
export function rewriteMediaUrls<T>(value: T): T {
  if (typeof value === "string") return toCdnMediaUrl(value) as T;
  if (Array.isArray(value)) return value.map(rewriteMediaUrls) as T;
  if (!isPlainObject(value)) return value;

  const result: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    result[key] = rewriteMediaUrls(entry);
  }
  return result as T;
}
