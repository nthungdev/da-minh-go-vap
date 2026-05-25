// Comment this line before runninng pnpm generate
import "server-only";

import { getPayload, PaginatedDocs, Where } from "payload";
import config from "@payload-config";
import { postToAppPost } from "@/utils/post";
import { defaultLocale, Locale } from "@/i18n/config";
import { Post } from "@/payload-types";

interface GetOptions {
  limit?: number;
  page?: number;
  skipSlug?: string;
  locale?: Locale;
}

export const getPostBySlug = async (
  slug: string,
  { locale }: { locale?: Locale } = {},
) => {
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
};

export async function queryAllPosts({ limit, page, locale }: GetOptions = {}) {
  const payload = await getPayload({ config });
  const query = await payload.find({
    collection: "posts",
    limit: limit ?? 100,
    sort: "-publishedAt",
    page: page ?? 1,
    where: {
      // Only get published posts
      publishedAt: {
        less_than: new Date().toISOString(),
      },
    },
    locale: locale ?? defaultLocale,
  });
  return query;
}

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

/**
 * Queries published posts for the provided hidden tag IDs with pagination.
 */
async function queryPostsByTagIds(
  hiddenTagIds: string[],
  { limit, page, skipSlug, locale }: GetOptions = {},
) {
  if (hiddenTagIds.length === 0) {
    return createEmptyPostsQuery({ limit, page });
  }

  const payload = await getPayload({ config });
  const queryConditions: Where[] = [
    {
      hiddenTags: {
        in: hiddenTagIds,
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

  return payload.find({
    collection: "posts",
    where: { and: queryConditions },
    sort: "-publishedAt",
    limit: limit ?? 10,
    page: page ?? 1,
    locale: locale ?? defaultLocale,
  });
}

export async function queryPostsByHiddenTags(
  hiddenTags: string[],
  { limit, page, skipSlug, locale }: GetOptions = {},
) {
  const payload = await getPayload({ config });

  const matchedHiddenTags = await payload.find({
    collection: "hiddenTags",
    where: {
      tag: { in: hiddenTags },
    },
    limit: hiddenTags.length,
  });

  return queryPostsByTagIds(
    matchedHiddenTags.docs.map((tag) => tag.id),
    {
      limit,
      page,
      skipSlug,
      locale,
    },
  );
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
  { limit, page, skipSlug, locale }: GetOptions = {},
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
  });

  return {
    tag: publicTag,
    query,
  };
}
