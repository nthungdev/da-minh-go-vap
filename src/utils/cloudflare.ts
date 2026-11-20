const CONFIGURED_MEDIA_CDN_URL = process.env.NEXT_PUBLIC_MEDIA_CDN_URL;

/** Path Payload uses to stream uploaded files from storage through the app server. */
const PAYLOAD_MEDIA_FILE_PATH = "/api/media/file/";

const DEFAULT_CDN_BASE = "https://cdn.dongdaminhgovap.org";
const DEFAULT_CDN_HOST = "cdn.dongdaminhgovap.org";

function isPassthroughUrl(trimmedUrl: string): boolean {
  if (trimmedUrl.startsWith("data:") || trimmedUrl.startsWith("blob:")) {
    return true;
  }
  const urlWithoutQuery = trimmedUrl.split(/[?#]/)[0] ?? "";
  return urlWithoutQuery.toLowerCase().endsWith(".svg");
}

function resolveCdnOrigin(): { cdnBase: string; cdnHost: string } {
  const configuredBase = (
    process.env.NEXT_PUBLIC_CDN_URL ||
    process.env.NEXT_PUBLIC_MEDIA_CDN_URL ||
    DEFAULT_CDN_BASE
  ).replace(/\/+$/, "");

  try {
    return {
      cdnBase: configuredBase,
      cdnHost: new URL(configuredBase).host.toLowerCase(),
    };
  } catch {
    return { cdnBase: DEFAULT_CDN_BASE, cdnHost: DEFAULT_CDN_HOST };
  }
}

function extractRelativePath(
  trimmedUrl: string,
  cdnHost: string,
): string | null {
  const isAbsolute = /^(?:[a-z]+:)?\/\//i.test(trimmedUrl);
  if (!isAbsolute) {
    return trimmedUrl;
  }

  try {
    const parsed = new URL(
      trimmedUrl.startsWith("//") ? `https:${trimmedUrl}` : trimmedUrl,
    );
    if (parsed.host.toLowerCase() !== cdnHost) {
      // External non-CDN URL: pass through safely without mangling
      return null;
    }
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return null;
  }
}

function normalizeTransformPath(
  relativePath: string,
): { cleanPath: string; suffix: string } | null {
  const suffixIndex = relativePath.search(/[?#]/);
  let pathname =
    suffixIndex === -1 ? relativePath : relativePath.slice(0, suffixIndex);
  const suffix = suffixIndex === -1 ? "" : relativePath.slice(suffixIndex);

  // Strip existing Cloudflare transform prefix if already present
  // e.g. /cdn-cgi/image/width=100,onerror=redirect/media/pic.jpg -> /media/pic.jpg
  const cdnCgiMatch = pathname.match(/^\/?cdn-cgi\/image\/[^/]+(\/.*)$/);
  if (cdnCgiMatch?.[1]) {
    pathname = cdnCgiMatch[1];
  }

  // Strip Payload media proxy prefix so proxied URLs map to the same CDN key
  if (pathname.startsWith(PAYLOAD_MEDIA_FILE_PATH)) {
    pathname = pathname.slice(PAYLOAD_MEDIA_FILE_PATH.length);
  }

  const cleanPath = pathname.replace(/^\/+/, "");
  if (!cleanPath) {
    return null;
  }

  return { cleanPath, suffix };
}

function buildTransformOptionsString(
  options: Record<string, string | number>,
): string {
  const optionsMap: Record<string, string | number> = {
    format: "auto",
    quality: "85",
    onerror: "redirect",
    ...options,
  };

  return Object.entries(optionsMap)
    .filter(
      ([, value]) =>
        value !== undefined && value !== null && String(value).trim() !== "",
    )
    .map(([key, value]) => `${key}=${value}`)
    .join(",");
}

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

  if (isPassthroughUrl(trimmedUrl)) {
    return trimmedUrl;
  }

  const { cdnBase, cdnHost } = resolveCdnOrigin();
  const relativePath = extractRelativePath(trimmedUrl, cdnHost);
  if (relativePath === null) {
    return trimmedUrl;
  }

  const normalized = normalizeTransformPath(relativePath);
  if (!normalized) {
    return "";
  }

  const optionsString = buildTransformOptionsString(options);
  return `${cdnBase}/cdn-cgi/image/${optionsString}/${normalized.cleanPath}${normalized.suffix}`;
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
