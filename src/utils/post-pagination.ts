import type { AppPost } from "@/definitions";

/**
 * Paginated post query payload returned by server actions and consumed by
 * React Query post grid and list components.
 */
export interface PaginatedPostsData {
  posts: AppPost[];
  hasMore: boolean;
  page: number;
  totalPages: number;
}

/**
 * Builds React Query `initialData` for single-page post groups (`AppPostGridAsync`,
 * `AppPostListAsync`), preserving SSR pagination metadata when available and falling
 * back to single-page defaults for legacy `posts`-only callers.
 */
export function buildPostGroupInitialData(params: {
  initialData?: PaginatedPostsData;
  posts?: AppPost[];
}): PaginatedPostsData | undefined {
  const { initialData, posts } = params;
  if (initialData) {
    return initialData;
  }
  if (posts) {
    return {
      posts,
      hasMore: false,
      page: 1,
      totalPages: 1,
    };
  }
  return undefined;
}

/**
 * Builds React Query `initialData` for `AppPostGridPaginated`.
 * Only seeds page 1 so navigating to subsequent pages fetches fresh data.
 */
export function buildPaginatedPostsInitialData(params: {
  page: number;
  initialData?: PaginatedPostsData;
  posts?: AppPost[];
}): PaginatedPostsData | undefined {
  const { page, initialData, posts } = params;
  if (page !== 1) {
    return undefined;
  }
  if (initialData) {
    return initialData.page === 1 ? initialData : undefined;
  }
  if (posts && posts.length > 0) {
    return {
      posts,
      hasMore: false,
      page: 1,
      totalPages: 1,
    };
  }
  return undefined;
}

/**
 * Determines whether pagination controls should be hidden.
 * Controls stay hidden only on page 1 when there are no additional pages.
 */
export function shouldHidePagination(params: {
  hasMore: boolean;
  totalPages: number;
  page: number;
}): boolean {
  const { hasMore, totalPages, page } = params;
  return !hasMore && totalPages <= 1 && page === 1;
}
