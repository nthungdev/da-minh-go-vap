import { AppPost } from "@/definitions";
import { HiddenTag, Post } from "@/payload-types";

export function postToAppPost(post: Post): AppPost {
  return {
    ...post,
    publishedAt: new Date(post.publishedAt),
    createdAt: new Date(post.createdAt),
    updatedAt: new Date(post.updatedAt),
  };
}

export function isPopulatedHiddenTag(
  hiddenTag: Post["hiddenTags"][number],
): hiddenTag is HiddenTag {
  return typeof hiddenTag !== "string";
}

export function getPublicHiddenTags(hiddenTags: Post["hiddenTags"]) {
  return hiddenTags
    .filter(isPopulatedHiddenTag)
    .filter((hiddenTag) => hiddenTag.isPublic);
}

export function makePostsPath(hiddenTags: string[], title: string) {
  const jointHiddenTags = hiddenTags.join(",");
  return `/posts?ht=${encodeURIComponent(jointHiddenTags)}&ti=${encodeURIComponent(title)}`;
}

export function makePublicTagPath(tag: string) {
  return `/posts/tags/${encodeURIComponent(tag)}`;
}
