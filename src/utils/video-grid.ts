const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export const DEFAULT_VIDEO_PAGE_SIZE = 8;

export interface VideoItem {
  id?: string | null;
  title: string;
  type: "youtube" | "facebook";
  url: string;
  isShort?: boolean | null;
}

export interface PaginatedVideosResult<T> {
  items: T[];
  activePage: number;
  totalPages: number;
  pageSize: number;
}

function parseHttpUrl(input: string): URL | null {
  try {
    const url = new URL(input.includes("://") ? input : `https://${input}`);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

/**
 * Extracts a YouTube video ID from various YouTube URL formats
 * including watch, embed, shorts, youtu.be, or raw video IDs.
 *
 * @param urlOrId - The YouTube URL or raw video ID
 * @returns The parsed YouTube video ID or an empty string for invalid input
 */
export function extractYoutubeId(urlOrId: string): string {
  if (!urlOrId) return "";

  const trimmedInput = urlOrId.trim();
  if (YOUTUBE_ID_PATTERN.test(trimmedInput)) return trimmedInput;

  const url = parseHttpUrl(trimmedInput);
  if (!url) return "";

  const hostname = url.hostname.toLowerCase();
  const isShortDomain = hostname === "youtu.be";
  const isYoutubeDomain =
    hostname === "youtube.com" || hostname.endsWith(".youtube.com");
  let candidate = "";

  if (isShortDomain) {
    candidate = url.pathname.split("/").filter(Boolean)[0] ?? "";
  } else if (isYoutubeDomain && url.pathname === "/watch") {
    candidate = url.searchParams.get("v") ?? "";
  } else if (isYoutubeDomain) {
    const pathMatch = url.pathname.match(/^\/(?:shorts|embed)\/([^/]+)\/?$/);
    candidate = pathMatch?.[1] ?? "";
  }

  return YOUTUBE_ID_PATTERN.test(candidate) ? candidate : "";
}

/**
 * Determines whether a given video URL corresponds to a YouTube Short.
 *
 * @param url - Video URL string
 * @param explicitlyShort - Whether the CMS marks a bare ID as a Short
 * @returns True if the URL or CMS field identifies a Short
 */
export function isYoutubeShort(url: string, explicitlyShort = false): boolean {
  if (explicitlyShort) return true;

  const parsedUrl = parseHttpUrl(url);
  if (!parsedUrl) return false;

  const hostname = parsedUrl.hostname.toLowerCase();
  const isYoutubeDomain =
    hostname === "youtube.com" || hostname.endsWith(".youtube.com");

  return isYoutubeDomain && /^\/shorts\/[^/]+\/?$/.test(parsedUrl.pathname);
}

/**
 * Normalizes a requested page size to a positive integer, falling back to
 * `DEFAULT_VIDEO_PAGE_SIZE` (8) when missing or invalid.
 */
export function normalizeVideoPageSize(pageSize?: number | null): number {
  if (typeof pageSize !== "number" || !Number.isFinite(pageSize)) {
    return DEFAULT_VIDEO_PAGE_SIZE;
  }
  const floored = Math.floor(pageSize);
  return floored >= 1 ? floored : DEFAULT_VIDEO_PAGE_SIZE;
}

/**
 * Resolves the active 1-based page number from a URL query parameter,
 * clamping invalid, non-positive, or out-of-range values to `1..Math.max(totalPages, 1)`.
 */
export function resolveVideoPage(
  queryPage: string | null | undefined,
  totalPages: number,
): number {
  const maxPage = Math.max(totalPages, 1);
  const trimmed = queryPage?.trim();
  if (!(trimmed && /^\d+$/.test(trimmed))) {
    return 1;
  }
  const parsed = Number.parseInt(trimmed, 10);
  if (parsed < 1) {
    return 1;
  }
  return Math.min(parsed, maxPage);
}

/**
 * Slices a video list for the requested page and computes normalized pagination metadata.
 */
export function paginateVideos<T>(
  videos: readonly T[],
  page: number,
  pageSize?: number | null,
): PaginatedVideosResult<T> {
  const safePageSize = normalizeVideoPageSize(pageSize);
  const totalPages = Math.ceil(videos.length / safePageSize);
  const maxPage = Math.max(totalPages, 1);
  const activePage = Number.isFinite(page)
    ? Math.min(Math.max(Math.floor(page), 1), maxPage)
    : 1;
  const startIndex = (activePage - 1) * safePageSize;

  return {
    items: videos.slice(startIndex, startIndex + safePageSize),
    activePage,
    totalPages,
    pageSize: safePageSize,
  };
}
