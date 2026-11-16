// Comment this line before running pnpm generate
import "server-only";

import { getPayload, PaginatedDocs, Where } from "payload";
import config from "@payload-config";
import { postToAppPost } from "@/utils/post";
import { defaultLocale, Locale } from "@/i18n/config";
import { Post } from "@/payload-types";
import { cache } from "react";
import { unstable_cache } from "next/cache";

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

function getPublishedTimeBucketIso(): string {
  const bucketMs = 60_000;
  return new Date(Math.floor(Date.now() / bucketMs) * bucketMs).toISOString();
}

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

const getPostBySlugCached = cache(async (slug: string, locale?: Locale) => {
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
      locale: locale ?? defaultLocale,
    });
    const post = query.docs[0];
    if (!post) return null;

    return postToAppPost(post);
  } catch {
    return null;
  }
});

export const getPostBySlug = (
  slug: string,
  { locale }: { locale?: Locale } = {},
) => getPostBySlugCached(slug, locale);

const queryAllPostsCached = unstable_cache(
  async (
    limit: number,
    page: number,
    locale: Locale,
    includeBody: boolean,
    nowIso: string,
  ) => {
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
          less_than: nowIso,
        },
      },
      locale,
    });
    return includeBody
      ? (query as PaginatedDocs<Post>)
      : normalizeCardPostsResult(query);
  },
  ["query-all-posts"],
  { tags: ["posts"], revalidate: 60 },
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
    getPublishedTimeBucketIso(),
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
    nowIso: string,
  ) => {
    const payload = await getPayload({ config });
    const queryConditions: Where[] = [
      {
        hiddenTags: {
          in: tagIds,
        },
        // Only get published posts
        publishedAt: {
          less_than: nowIso,
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
    return includeBody
      ? (query as PaginatedDocs<Post>)
      : normalizeCardPostsResult(query);
  },
  ["query-posts-by-tag-ids"],
  { tags: ["posts"], revalidate: 60 },
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
    getPublishedTimeBucketIso(),
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
export async function getPublicHiddenTagByTag(tag: string) {
  const payload = await getPayload({ config });

  const query = await payload.find({
    collection: "hiddenTags",
    where: {
      and: [{ tag: { equals: tag } }, { isPublic: { equals: true } }],
    },
    limit: 1,
  });

  return query.docs[0] ?? null;
}

/**
 * Queries published posts for a public tag and returns both the tag and paginated post query.
 */
export async function queryPostsByPublicTag(
  tag: string,
  { limit, page, skipSlug, locale, includeBody }: GetOptions = {},
) {
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
}
