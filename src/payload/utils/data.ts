import {
  revalidatePath as nextRevalidatePath,
  revalidateTag as nextRevalidateTag,
} from "next/cache";

const DEFAULT_CACHE_TAGS = [
  "pages",
  "posts",
  "globals",
  "navBar",
  "footer",
  "siteSettings",
  "hiddenTags",
] as const;

export function isDataValid<T extends object>(
  data: string | T | null | undefined,
) {
  return !!data && typeof data !== "string";
}

/**
 * If the data is not an object, it's considered not existed.
 * This utility function is used to ensure that we only return valid data objects.
 * @param data
 */
export function getDataOrUndefined<T extends object>(
  data: string | T | null | undefined,
) {
  return isDataValid(data) ? data : null;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Revalidates Next.js route and data cache tags for the given path.
 *
 * Executes in-process Next.js cache invalidation (`revalidatePath` and `revalidateTag`)
 * and falls back to the internal `/api/revalidate` endpoint when called outside a request context.
 *
 * @param path - The route path to revalidate.
 * @param tags - Cache tags to invalidate alongside the path.
 */
export async function revalidatePath(
  path: string,
  tags: readonly string[] = DEFAULT_CACHE_TAGS,
) {
  try {
    nextRevalidatePath(path);
    for (const tag of tags) {
      nextRevalidateTag(tag);
    }
  } catch {
    // Fallback to HTTP endpoint if called outside a Next.js request context
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    `http://127.0.0.1:${process.env.PORT || 3000}`;
  await fetch(`${baseUrl}/api/revalidate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, tags }),
  }).catch((err) => {
    console.error("Failed to revalidate path:", path, err);
  });
}
