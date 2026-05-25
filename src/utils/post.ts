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

/**
 * Returns true when the relationship value is a populated hidden tag document.
 */
export function isPopulatedHiddenTag(
  hiddenTag: Post["hiddenTags"][number],
): hiddenTag is HiddenTag {
  return typeof hiddenTag !== "string";
}

/**
 * Filters a post's tags down to the ones marked for public display.
 */
export function getPublicHiddenTags(
  hiddenTags: Post["hiddenTags"],
): HiddenTag[] {
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
