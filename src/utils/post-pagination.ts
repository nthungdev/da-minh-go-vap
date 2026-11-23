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

export const DEFAULT_POST_GROUP_LIMIT = 4;
export const DEFAULT_PAGINATED_POST_GROUP_LIMIT = 12;

export type PostGroupRenderMode =
  | "paginated-grid"
  | "grid"
  | "list"
  | "unknown";

export interface PostGroupRenderConfig {
  mode: PostGroupRenderMode;
  pageSize: number;
  showViewMore: boolean;
}

/**
 * Resolves the effective post limit for a `PostGroupBlock`.
 * Preserves an explicit positive `limit`, otherwise defaults to `12` for
 * paginated grids and `4` for non-paginated groups.
 */
export function resolvePostGroupLimit(params: {
  limit?: number | null;
  enablePagination?: boolean | null;
  displayType?: "grid" | "list";
}): number {
  const { limit, enablePagination, displayType } = params;
  if (typeof limit === "number" && limit > 0) {
    return limit;
  }
  const isPaginatedGrid =
    Boolean(enablePagination) &&
    (displayType === undefined || displayType === "grid");
  return isPaginatedGrid
    ? DEFAULT_PAGINATED_POST_GROUP_LIMIT
    : DEFAULT_POST_GROUP_LIMIT;
}

/**
 * Resolves the rendering mode, effective page size, and "Xem tiếp" precedence
 * for `PostGroup`. Inline pagination applies only to `grid` display and
 * suppresses `showViewMore` when active.
 */
export function resolvePostGroupRenderConfig(params: {
  type: "grid" | "list";
  limit?: number | null;
  enablePagination?: boolean | null;
  hasMore?: boolean | null;
}): PostGroupRenderConfig {
  const { type, limit, enablePagination, hasMore } = params;

  if (type === "list") {
    return {
      mode: "list",
      pageSize: resolvePostGroupLimit({
        limit,
        enablePagination: false,
        displayType: "list",
      }),
      showViewMore: false,
    };
  }

  if (type === "grid") {
    const isPaginated = Boolean(enablePagination);
    return {
      mode: isPaginated ? "paginated-grid" : "grid",
      pageSize: resolvePostGroupLimit({
        limit,
        enablePagination: isPaginated,
        displayType: "grid",
      }),
      showViewMore: isPaginated ? false : Boolean(hasMore),
    };
  }

  return {
    mode: "unknown",
    pageSize: DEFAULT_POST_GROUP_LIMIT,
    showViewMore: false,
  };
}
