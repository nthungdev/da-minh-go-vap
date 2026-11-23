/** Matches a 24-hex-character MongoDB ObjectId. */
export const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

export type PostsPageSearchParams = {
  /** hidden tags, comma-separated */
  ht?: string;
  /** title */
  ti?: string;
  /** contributor id */
  c?: string;
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

/** Parses and validates the `/posts` query string. */
export function parsePostsPageParams({
  ht,
  ti,
  c,
}: PostsPageSearchParams): PostsPageParams {
  const hiddenTags = ht ? decodeURIComponent(ht).split(",") : [];
  const title = ti ? decodeURIComponent(ti) : undefined;

  if (c === undefined) {
    return { hiddenTags, title, invalid: false };
  }

  const contributorId = c.trim();
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
