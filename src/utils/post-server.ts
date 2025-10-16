import "server-only";

import { getPayload, Where } from "payload";
import config from "@payload-config";
import { postToAppPost } from "@/utils/post";
import { defaultLocale, Locale } from "@/i18n/config";

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

  const queryConditions: Where[] = [
    {
      hiddenTags: {
        in: matchedHiddenTags.docs.map((tag) => tag.id),
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
    where: { and: queryConditions },
    sort: "-publishedAt", // Sort by publishedAt DESC
    limit: limit ?? 10,
    page: page ?? 1,
    locale: locale ?? defaultLocale,
  });

  return query;
}
