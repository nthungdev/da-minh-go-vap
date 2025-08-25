import { getPayload, Where } from "payload";
import config from "@payload-config";
import { postToAppPost } from "@/utils/post";

interface GetOptions {
  limit?: number;
  page?: number;
  skipSlug?: string;
}

export const getPostBySlug = async (slug: string) => {
  try {
    const payload = await getPayload({ config });
    const query = await payload.find({
      collection: "posts",
      where: { slug: { equals: slug } },
      limit: 1,
    });
    const post = query.docs[0];
    if (!post) return null;

    return postToAppPost(post);
  } catch {
    return null;
  }
};

export const getPostsBySlugs = async (slugs: string[]) => {
  const posts = await Promise.all(slugs.map((slug) => getPostBySlug(slug)));
  return posts.filter((post) => post !== null);
};

export async function queryAllPosts({ limit, page }: GetOptions = {}) {
  const payload = await getPayload({ config });
  const query = await payload.find({
    collection: "posts",
    limit: limit ?? 100,
    sort: "-publishedAt",
    page: page ?? 1,
  });
  return query;
}

export async function queryPostsByHiddenTags(
  hiddenTags: string[],
  { limit, page, skipSlug }: GetOptions = {},
) {
  const payload = await getPayload({ config });

  const matchedHiddenTags = await payload.find({
    collection: "hiddenTags",
    where: { tag: { in: hiddenTags } },
    limit: hiddenTags.length,
  });

  const queryConditions: Where[] = [
    {
      hiddenTags: {
        in: matchedHiddenTags.docs.map((tag) => tag.id),
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
  });

  return query;
}
