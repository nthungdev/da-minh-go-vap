export interface HighlightSegment {
  text: string;
  highlighted: boolean;
}

export interface PopulatedTagLike {
  label?: string | null;
  tag?: string | null;
  isPublic?: boolean | null;
}

export interface SearchTagOption {
  id: string;
  tagId: string;
  label: string;
}

export interface RawSearchTagDoc {
  id: string;
  label?: string | null;
  tag?: string | { id: string; label?: string | null } | null;
}

/**
 * Normalizes Payload `searchTags` documents into pill options, skipping any
 * entries with unpopulated or empty tag references.
 */
export function resolveSearchTagOptions(
  docs: RawSearchTagDoc[],
): SearchTagOption[] {
  const options: SearchTagOption[] = [];
  for (const doc of docs) {
    if (!doc.tag || typeof doc.tag !== "object") continue;
    const tagId = doc.tag.id;
    const label = doc.label?.trim() || doc.tag.label?.trim() || "";
    if (!tagId || !label) continue;
    options.push({ id: doc.id, tagId, label });
  }
  return options;
}

export const RECENT_SEARCHES_STORAGE_KEY = "daminh_recent_searches";
export const MAX_RECENT_SEARCHES = 5;

/**
 * Strips Vietnamese diacritics and normalizes casing so unaccented queries
 * like "da minh" match titles like "Đa Minh".
 */
export function normalizeVietnamese(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

interface NormalizedCharMap {
  normalized: string;
  origStarts: number[];
  origEnds: number[];
}

/**
 * Builds a character-level index map from diacritic-stripped lowercase text
 * back to the original string's UTF-16 code unit offsets.
 */
function buildNormalizedMap(text: string): NormalizedCharMap {
  let normalized = "";
  const origStarts: number[] = [];
  const origEnds: number[] = [];

  for (let i = 0; i < text.length; ) {
    const codePoint = text.codePointAt(i);
    if (codePoint === undefined) break;
    const charLen = codePoint > 0xffff ? 2 : 1;
    const origChar = text.slice(i, i + charLen);
    const normChar = normalizeVietnamese(origChar);

    for (let j = 0; j < normChar.length; j += 1) {
      normalized += normChar[j];
      origStarts.push(i);
      origEnds.push(i + charLen);
    }

    i += charLen;
  }

  return { normalized, origStarts, origEnds };
}

/**
 * Splits `text` into plain and highlighted segments matching `query` tokens
 * diacritic-insensitively. Safe for React rendering without HTML injection.
 */
export function splitHighlightSegments(
  text: string,
  query: string,
): HighlightSegment[] {
  if (!text) return [];

  const trimmed = query.trim();
  if (!trimmed) {
    return [{ text, highlighted: false }];
  }

  const normalizedPhrase = normalizeVietnamese(trimmed).replace(/\s+/g, " ");
  const wordTokens = normalizedPhrase
    .split(" ")
    .map((t) => t.trim())
    .filter(Boolean);

  const tokens = Array.from(
    new Set(
      wordTokens.length > 1 ? [normalizedPhrase, ...wordTokens] : wordTokens,
    ),
  );

  if (tokens.length === 0) {
    return [{ text, highlighted: false }];
  }

  const { normalized, origStarts, origEnds } = buildNormalizedMap(text);
  const ranges: Array<[number, number]> = [];

  for (const token of tokens) {
    let searchFrom = 0;
    while (searchFrom < normalized.length) {
      const matchIdx = normalized.indexOf(token, searchFrom);
      if (matchIdx === -1) break;
      const start = origStarts[matchIdx];
      const end = origEnds[matchIdx + token.length - 1];
      if (start !== undefined && end !== undefined && end > start) {
        ranges.push([start, end]);
      }
      searchFrom = matchIdx + token.length;
    }
  }

  if (ranges.length === 0) {
    return [{ text, highlighted: false }];
  }

  ranges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  const merged: Array<[number, number]> = [];
  for (const [start, end] of ranges) {
    const prev = merged[merged.length - 1];
    if (prev && start <= prev[1]) {
      prev[1] = Math.max(prev[1], end);
    } else {
      merged.push([start, end]);
    }
  }

  const segments: HighlightSegment[] = [];
  let cursor = 0;

  for (const [start, end] of merged) {
    if (start > cursor) {
      segments.push({ text: text.slice(cursor, start), highlighted: false });
    }
    segments.push({ text: text.slice(start, end), highlighted: true });
    cursor = end;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), highlighted: false });
  }

  return segments;
}

/**
 * Formats a post publish date for search result metadata in the active locale.
 */
export function formatSearchPostDate(
  dateInput: Date | string | null | undefined,
  locale: string,
): string {
  if (!dateInput) return "";
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "";

  const intlLocale = locale === "en" ? "en-US" : "vi-VN";
  return new Intl.DateTimeFormat(intlLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Extracts the primary display label from a post's `hiddenTags` relationship
 * array, preferring public tags when available.
 */
export function getPostPrimaryCategoryLabel(
  hiddenTags: Array<string | PopulatedTagLike> | null | undefined,
): string | null {
  if (!Array.isArray(hiddenTags) || hiddenTags.length === 0) {
    return null;
  }

  const populated = hiddenTags.filter(
    (item): item is PopulatedTagLike =>
      typeof item === "object" &&
      item !== null &&
      typeof item.label === "string" &&
      item.label.trim().length > 0,
  );

  if (populated.length === 0) {
    return null;
  }

  const publicTag = populated.find((item) => item.isPublic);
  const selected = publicTag ?? populated[0];
  return selected?.label?.trim() ?? null;
}

/**
 * Parses serialized recent searches from localStorage safely.
 */
export function parseRecentSearches(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    const result: string[] = [];

    for (const item of parsed) {
      if (typeof item !== "string") continue;
      const trimmed = item.trim();
      if (!trimmed) continue;
      const key = trimmed.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(trimmed);
      if (result.length >= MAX_RECENT_SEARCHES) break;
    }

    return result;
  } catch {
    return [];
  }
}

/**
 * Prepends a search query to the recent searches list, deduplicating
 * case-insensitively and capping at `maxItems`.
 */
export function addRecentSearch(
  existing: string[],
  query: string,
  maxItems = MAX_RECENT_SEARCHES,
): string[] {
  const trimmed = query.trim();
  if (!trimmed) return existing.slice(0, maxItems);

  const normalizedQuery = trimmed.toLowerCase();
  const filtered = existing.filter(
    (item) => item.trim().toLowerCase() !== normalizedQuery,
  );

  return [trimmed, ...filtered].slice(0, maxItems);
}
