import { AppPost } from "@/definitions";
import { Post } from "@/payload-types";

export function postToAppPost(post: Post): AppPost {
  return {
    ...post,
    publishedAt: new Date(post.publishedAt),
    createdAt: new Date(post.createdAt),
    updatedAt: new Date(post.updatedAt),
  };
}

export function makePostsPath(hiddenTags: string[], title: string) {
  const jointHiddenTags = hiddenTags.join(",");
  return `/posts?ht=${encodeURIComponent(jointHiddenTags)}&ti=${encodeURIComponent(title)}`;
}
