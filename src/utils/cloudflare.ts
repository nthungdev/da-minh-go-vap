const MEDIA_CDN_URL =
  process.env.NEXT_PUBLIC_MEDIA_CDN_URL || "https://cdn.dongdaminhgovap.org";

/** Path Payload uses to stream uploaded files from storage through the app server. */
const PAYLOAD_MEDIA_FILE_PATH = "/api/media/file/";

/**
 * Transform Payload media url to Cloudflare image url.
 * Ref: https://developers.cloudflare.com/images/transform-images/transform-via-url
 */
export function transformUrl(
  url: string,
  options: Record<string, string> = {},
) {
  if (!url) return "";
  const filename = url.split("/").pop();

  const optionsString = Object.entries({
    format: "auto",
    quality: "85",
    onerror: "redirect",
    ...options,
  })
    .map(([key, value]) => `${key}=${value}`)
    .join(",");

  const transformUrl = `${MEDIA_CDN_URL}/cdn-cgi/image/${optionsString}/${filename}`;
  return transformUrl;
}

/**
 * Rewrites a Payload-proxied media URL (`/api/media/file/<name>`) to the media CDN origin.
 * Other values are returned unchanged.
 */
export function toCdnMediaUrl(url: string): string {
  if (!url.startsWith(PAYLOAD_MEDIA_FILE_PATH)) return url;
  return `${MEDIA_CDN_URL}/${url.slice(PAYLOAD_MEDIA_FILE_PATH.length)}`;
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
 * markdown bodies is left as-is.
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
