import "server-only";

import config from "@payload-config";
import { unstable_cache } from "next/cache";
import { getPayload, type PaginatedDocs, type Where } from "payload";
import { cache } from "react";
import type { AppPost } from "@/definitions";
import { defaultLocale, type Locale } from "@/i18n/config";
import type { Post } from "@/payload-types";
import { rewriteMediaUrls } from "@/utils/cloudflare";
import { postToAppPost } from "@/utils/post";
import { PUBLISHED_CONTENT_REVALIDATE_SECONDS } from "@/utils/published-content-cache";

interface GetOptions {
  limit?: number;
  page?: number;
  skipSlug?: string;
  locale?: Locale;
  includeBody?: boolean;
}

const POST_CARD_SELECT = {
  title: true,
  slug: true,
  shortBody: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  thumbnail: true,
  hiddenTags: true,
} as const;

const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

function normalizeCardPostsResult(
  query: PaginatedDocs<Partial<Post>>,
): PaginatedDocs<Post> {
  return {
    ...query,
    docs: query.docs.map(
      (doc) =>
        ({
          body: null,
          template: null,
          contentBlocks: null,
          videos: [],
          ...doc,
        }) as Post,
    ),
  };
}

const getPostBySlugCached = cache(async (slug: string, locale: Locale) => {
  try {
    const payload = await getPayload({ config });
    const query = await payload.find({
      collection: "posts",
      where: {
        slug: { equals: slug },
        // Only get published posts
        publishedAt: {
          less_than: new Date().toISOString(),
        },
      },
      limit: 1,
      pagination: false,
      locale,
    });
    const post = query.docs[0];
    if (!post) return null;

    return postToAppPost(rewriteMediaUrls(post));
  } catch {
    return null;
  }
});

export const getPostBySlug = (
  slug: string,
  { locale }: { locale?: Locale } = {},
) => getPostBySlugCached(slug, locale ?? defaultLocale);

const getPostsBySlugsCached = unstable_cache(
  async (sortedUniqueSlugs: string[], locale: Locale) => {
    const payload = await getPayload({ config });
    const query = await payload.find({
      collection: "posts",
      where: {
        slug: { in: sortedUniqueSlugs },
        // Only get published posts
        publishedAt: {
          less_than: new Date().toISOString(),
        },
      },
      limit: sortedUniqueSlugs.length,
      pagination: false,
      locale,
    });

    const entries: [string, AppPost][] = [];
    for (const doc of query.docs) {
      if (!doc.slug) continue;
      try {
        entries.push([doc.slug, postToAppPost(rewriteMediaUrls(doc))]);
      } catch (error) {
        console.error(
          `[post-server] Failed to map post "${doc.slug}" in batch:`,
          error,
        );
      }
    }
    return entries;
  },
  ["posts-by-slugs"],
  { tags: ["posts"], revalidate: PUBLISHED_CONTENT_REVALIDATE_SECONDS },
);

/**
 * Fetches multiple published posts by their slugs in a single batched, cached query,
 * preserving the order of the input slugs and omitting unpublished or missing posts.
 */
export const getPostsBySlugs = cache(
  async (slugs: string[], { locale }: { locale?: Locale } = {}) => {
    if (slugs.length === 0) {
      return [];
    }

    try {
      const sortedUniqueSlugs = Array.from(new Set(slugs)).sort();
      const entries = await getPostsBySlugsCached(
        sortedUniqueSlugs,
        locale ?? defaultLocale,
      );
      const postMap = new Map<string, AppPost>(entries);

      return slugs
        .map((slug) => postMap.get(slug))
        .filter((post): post is AppPost => post !== undefined);
    } catch (error) {
      console.error("[post-server] Failed to fetch posts by slugs:", error);
      return [];
    }
  },
);

const queryAllPostsCached = unstable_cache(
  async (limit: number, page: number, locale: Locale, includeBody: boolean) => {
    const payload = await getPayload({ config });
    const query = await payload.find({
      collection: "posts",
      depth: 1,
      select: includeBody ? undefined : POST_CARD_SELECT,
      limit,
      sort: "-publishedAt",
      page,
      where: {
        // Only get published posts
        publishedAt: {
          less_than: new Date().toISOString(),
        },
      },
      locale,
    });
    return rewriteMediaUrls(
      includeBody
        ? (query as PaginatedDocs<Post>)
        : normalizeCardPostsResult(query),
    );
  },
  ["query-all-posts"],
  { tags: ["posts"], revalidate: PUBLISHED_CONTENT_REVALIDATE_SECONDS },
);

export async function queryAllPosts({
  limit,
  page,
  locale,
  includeBody = false,
}: GetOptions = {}) {
  return queryAllPostsCached(
    limit ?? 100,
    page ?? 1,
    locale ?? defaultLocale,
    includeBody,
  );
}

/** Create result for empty query to avoid making network requests */
function createEmptyPostsQuery({
  limit,
  page,
}: GetOptions = {}): PaginatedDocs<Post> {
  return {
    docs: [],
    hasNextPage: false,
    hasPrevPage: false,
    limit: limit ?? 10,
    nextPage: null,
    page: page ?? 1,
    pagingCounter: 1,
    prevPage: null,
    totalDocs: 0,
    totalPages: 1,
  };
}

const queryPostsByTagIdsCached = unstable_cache(
  async (
    tagIds: string[],
    limit: number,
    page: number,
    skipSlug: string | undefined,
    locale: Locale,
    includeBody: boolean,
  ) => {
    const payload = await getPayload({ config });
    const queryConditions: Where[] = [
      {
        hiddenTags: {
          in: tagIds,
        },
        // Only get published posts
        publishedAt: {
          less_than: new Date().toISOString(),
        },
      },
    ];
    if (skipSlug) {
      queryConditions.push({
        slug: { not_equals: skipSlug },
      });
    }

    const query = await payload.find({
      collection: "posts",
      depth: 1,
      select: includeBody ? undefined : POST_CARD_SELECT,
      where: { and: queryConditions },
      sort: "-publishedAt", // Sort by publishedAt DESC
      limit,
      page,
      locale,
    });
    return rewriteMediaUrls(
      includeBody
        ? (query as PaginatedDocs<Post>)
        : normalizeCardPostsResult(query),
    );
  },
  ["query-posts-by-tag-ids"],
  { tags: ["posts"], revalidate: PUBLISHED_CONTENT_REVALIDATE_SECONDS },
);

/**
 * Queries published posts for the provided hidden tag IDs with pagination.
 */
async function queryPostsByTagIds(
  tagIds: string[],
  { limit, page, skipSlug, locale, includeBody = false }: GetOptions = {},
) {
  if (tagIds.length === 0) {
    return createEmptyPostsQuery({ limit, page });
  }

  const sortedTagIds = [...tagIds].sort();
  return queryPostsByTagIdsCached(
    sortedTagIds,
    limit ?? 10,
    page ?? 1,
    skipSlug,
    locale ?? defaultLocale,
    includeBody,
  );
}

const resolveHiddenTagIdsCached = unstable_cache(
  async (tags: string[]) => {
    const payload = await getPayload({ config });
    const matchedHiddenTags = await payload.find({
      collection: "hiddenTags",
      depth: 0,
      where: {
        tag: { in: tags },
      },
      limit: tags.length,
    });
    return matchedHiddenTags.docs.map((tag) => tag.id);
  },
  ["resolve-hidden-tag-ids"],
  { tags: ["posts", "hiddenTags"], revalidate: 300 },
);

export async function queryPostsByHiddenTags(
  hiddenTags: string[],
  { limit, page, skipSlug, locale, includeBody }: GetOptions = {},
) {
  if (hiddenTags.length === 0) {
    return createEmptyPostsQuery({ limit, page });
  }

  const allAreObjectIds = hiddenTags.every((tag) => OBJECT_ID_REGEX.test(tag));
  const tagIds = allAreObjectIds
    ? hiddenTags
    : await resolveHiddenTagIdsCached([...hiddenTags].sort());

  return queryPostsByTagIds(tagIds, {
    limit,
    page,
    skipSlug,
    locale,
    includeBody,
  });
}

/**
 * Returns the public hidden tag document for a tag value, or null if it is private or missing.
 */
export const getPublicHiddenTagByTag = cache(async (tag: string) => {
  const payload = await getPayload({ config });

  const query = await payload.find({
    collection: "hiddenTags",
    where: {
      and: [{ tag: { equals: tag } }, { isPublic: { equals: true } }],
    },
    limit: 1,
    pagination: false,
  });

  return query.docs[0] ?? null;
});

/**
 * Internal cached query for public tag posts using primitive parameters.
 */
const queryPostsByPublicTagInternal = cache(
  async (
    tag: string,
    limit: number,
    page: number,
    skipSlug: string | undefined,
    locale: Locale,
    includeBody: boolean,
  ) => {
    const publicTag = await getPublicHiddenTagByTag(tag);

    if (!publicTag) {
      return null;
    }

    const query = await queryPostsByTagIds([publicTag.id], {
      limit,
      page,
      skipSlug,
      locale,
      includeBody,
    });

    return {
      tag: publicTag,
      query,
    };
  },
);

/**
 * Queries published posts for a public tag and returns both the tag and paginated post query.
 */
export const queryPostsByPublicTag = cache(
  async (
    tag: string,
    { limit, page, skipSlug, locale, includeBody }: GetOptions = {},
  ) => {
    return queryPostsByPublicTagInternal(
      tag,
      limit ?? 10,
      page ?? 1,
      skipSlug,
      locale ?? defaultLocale,
      includeBody ?? false,
    );
  },
);
