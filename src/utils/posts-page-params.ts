/** Matches a 24-hex-character MongoDB ObjectId. */
export const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

/** A query value as Next.js delivers it: repeated keys arrive as arrays. */
type SearchParamValue = string | string[] | undefined;

export type PostsPageSearchParams = {
  /** hidden tags, comma-separated */
  ht?: SearchParamValue;
  /** title */
  ti?: SearchParamValue;
  /** contributor id */
  c?: SearchParamValue;
};

export type PostsPageParams = {
  hiddenTags: string[];
  /** Explicit `ti` title; wins over the contributor name in the header. */
  title?: string;
  /** Valid contributor id, when `c` is present. */
  contributorId?: string;
  /** True when `c` is present but not an ObjectId; the page should 404. */
  invalid: boolean;
};

function firstValue(value: SearchParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Decodes a (possibly double-encoded) value; a malformed escape such as a
 * literal `%` would throw `URIError`, so keep the value as-is instead.
 */
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** Parses and validates the `/posts` query string. */
export function parsePostsPageParams({
  ht,
  ti,
  c,
}: PostsPageSearchParams): PostsPageParams {
  const htValue = firstValue(ht);
  const tiValue = firstValue(ti);
  const hiddenTags = htValue ? safeDecode(htValue).split(",") : [];
  const title = tiValue ? safeDecode(tiValue) : undefined;

  if (c === undefined) {
    return { hiddenTags, title, invalid: false };
  }
  // A repeated `c` is ambiguous; 404 rather than pick one
  if (typeof c !== "string") {
    return { hiddenTags, title, invalid: true };
  }

  // Lowercase so every casing shares one canonical URL and cache entry
  const contributorId = c.trim().toLowerCase();
  if (!OBJECT_ID_REGEX.test(contributorId)) {
    return { hiddenTags, title, invalid: true };
  }
  return { hiddenTags, title, contributorId, invalid: false };
}

/** Header precedence: explicit `ti`, then the contributor's name, then the default title. */
export function resolvePostsPageTitle(
  params: Pick<PostsPageParams, "title">,
  contributorName: string | undefined,
  defaultTitle: string,
): string {
  return params.title || contributorName || defaultTitle;
}
