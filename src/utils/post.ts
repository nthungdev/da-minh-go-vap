import path from "path";
import fs from "fs";
import { getPayload } from "payload";
import config from "@payload-config";
import { AppPost } from "@/definitions";
import { Post } from "@/payload-types";

const postsDirectory = path.join(process.cwd(), "src/content/posts");

export const getPostBySlug = async (slug: string) => {
  try {
    const payload = await getPayload({ config });
    const query = await payload.find({
      collection: "posts",
      where: { slug: { equals: slug } },
    });
    const post = query.docs[0];
    if (!post) {
      return null;
    }
    return postToAppPost(post);
  } catch {
    return null;
  }
};

export const getPostsBySlugs = async (slugs: string[]) => {
  const posts = await Promise.all(slugs.map((slug) => getPostBySlug(slug)));
  return posts.filter((post) => post !== null);
};

// TODO update to use Payload
export const getAllPostSlugs = () => {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => {
    return fileName.replace(/\.md$/, "");
  });
};

export async function getAllPosts({
  limit = undefined,
}: { limit?: number } = {}) {
  const payload = await getPayload({ config });
  const query = await payload.find({
    collection: "posts",
  });
  const posts = query.docs
    .map(postToAppPost)
    .toSorted((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, limit);
  return posts;
}

export async function getPostsByHiddenTags(
  hiddenTags: string[],
  { limit = undefined }: { limit?: number } = {},
) {
  const payload = await getPayload({ config });
  const query = await payload.find({
    collection: "posts",
  });
  const posts = query.docs.map(postToAppPost);
  return posts
    .filter((post) => {
      const postHiddenTags = new Set(
        post.hiddenTags
          // tag is a string when reference not found
          .filter((a) => typeof a !== "string")
          .map((a) => a.tag),
      );
      return hiddenTags.some((tag) => postHiddenTags.has(tag));
    })
    .toSorted((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, limit);
}

export function postToAppPost(post: Post): AppPost {
  return {
    ...post,
    publishedAt: new Date(post.publishedAt),
    createdAt: new Date(post.createdAt),
    updatedAt: new Date(post.updatedAt),
  };
}
