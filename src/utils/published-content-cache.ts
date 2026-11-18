/**
 * Data cache lifetime for queries filtered by `publishedAt < now`.
 * Publishing revalidates the `posts` tag immediately; this bound only covers
 * scheduled posts whose `publishedAt` passes without a write.
 */
export const PUBLISHED_CONTENT_REVALIDATE_SECONDS = 60;
