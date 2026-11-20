import "server-only";
import config from "@payload-config";
import { unstable_cache } from "next/cache";
import { getPayload } from "payload";
import { cache } from "react";
import { defaultLocale, type Locale } from "@/i18n/config";
import { type CategoryPostItem, stripMedia } from "@/utils/menu";
import { makePostPath } from "@/utils/post";
import { PUBLISHED_CONTENT_REVALIDATE_SECONDS } from "@/utils/published-content-cache";
import { getCategoryPostsKey } from "@/utils/streaming";

const MENU_CATEGORY_POST_LIMIT = 8;

/** Mega-menu posts keyed by `getCategoryPostsKey(category.tagIds)`. */
export type MenuCategoryPosts = Record<string, CategoryPostItem[]>;

// Errors propagate so unstable_cache never stores a failed result;
// getMenuCategoryPosts falls back to {} for that request only.
async function fetchCategoryPosts(
  tagIds: string[],
  locale: Locale,
): Promise<CategoryPostItem[]> {
  const payload = await getPayload({ config });
  const query = await payload.find({
    collection: "posts",
    depth: 1,
    select: { title: true, slug: true, thumbnail: true, publishedAt: true },
    where: {
      and: [
        { hiddenTags: { in: tagIds } },
        { publishedAt: { less_than: new Date().toISOString() } },
      ],
    },
    limit: MENU_CATEGORY_POST_LIMIT,
    sort: "-publishedAt",
    locale,
  });
  return query.docs.map((p) => ({
    title: p.title,
    slug: p.slug,
    href: makePostPath(p.slug),
    thumbnail: stripMedia(p.thumbnail),
    publishedAt: p.publishedAt,
  }));
}

const getMenuCategoryPostsCached = unstable_cache(
  async (locale: Locale): Promise<MenuCategoryPosts> => {
    const payload = await getPayload({ config });
    const navBar = await payload.findGlobal({
      slug: "navBar",
      locale,
      depth: 0,
    });

    // Categories sharing the same tags share one query.
    const tagSets = new Map<string, string[]>();
    for (const menuItem of navBar.menu ?? []) {
      for (const cat of menuItem.categories ?? []) {
        // depth: 0 leaves relationships as ID strings.
        const tagIds = (cat.tags ?? []).filter(
          (t): t is string => typeof t === "string",
        );
        if (tagIds.length > 0) tagSets.set(getCategoryPostsKey(tagIds), tagIds);
      }
    }

    const entries = await Promise.all(
      [...tagSets].map(
        async ([key, tagIds]) =>
          [key, await fetchCategoryPosts(tagIds, locale)] as const,
      ),
    );
    return Object.fromEntries(entries);
  },
  ["nav-menu-category-posts"],
  {
    tags: ["globals", "navBar", "posts"],
    revalidate: PUBLISHED_CONTENT_REVALIDATE_SECONDS,
  },
);

/**
 * Latest posts for every mega-menu category. Callers pass the pending promise
 * to the client so the navbar renders before these queries finish.
 */
export const getMenuCategoryPosts = cache(
  async (locale?: Locale): Promise<MenuCategoryPosts> => {
    try {
      return await getMenuCategoryPostsCached(locale ?? defaultLocale);
    } catch (error) {
      console.error("[getMenuCategoryPosts] failed", error);
      return {};
    }
  },
);
