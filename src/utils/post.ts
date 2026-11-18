import { AppPost } from "@/definitions";
import { HiddenTag, Media, Post } from "@/payload-types";

export function postToAppPost(post: Post): AppPost {
  return {
    ...post,
    publishedAt: new Date(post.publishedAt),
    createdAt: new Date(post.createdAt),
    updatedAt: new Date(post.updatedAt),
  };
}

/**
 * Converts a Payload Post into a lightweight AppPost for cards and lists,
 * stripping heavy body, template, and block payloads from RSC serialization.
 */
export function postToCardAppPost(post: Post): AppPost {
  const thumbnail =
    typeof post.thumbnail === "object" && post.thumbnail !== null
      ? ({
          id: post.thumbnail.id,
          url: post.thumbnail.url,
          alt: post.thumbnail.alt,
          filename: post.thumbnail.filename,
          width: post.thumbnail.width,
          height: post.thumbnail.height,
        } as Media)
      : post.thumbnail;

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    shortBody: post.shortBody ?? null,
    hiddenTags: post.hiddenTags ?? [],
    thumbnail,
    body: null,
    template: null,
    contentBlocks: null,
    videos: [],
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

export function makePostPath(slug: string) {
  return `/posts/${slug}`;
}

export function makePostsPath(hiddenTags: string[], title: string) {
  const jointHiddenTags = hiddenTags.join(",");
  return `/posts?ht=${encodeURIComponent(jointHiddenTags)}&ti=${encodeURIComponent(title)}`;
}

export function makePublicTagPath(tag: string) {
  return `/posts/tags/${encodeURIComponent(tag)}`;
}
