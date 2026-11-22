"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Suspense, useCallback, useRef, useState } from "react";
import { fetchPostsByHiddenTags, fetchPostsByPublicTag } from "@/actions/post";
import AppPostGrid from "@/components/app-post-grid";
import PaginationPanel from "@/components/pagination-panel";
import type { AppPost } from "@/definitions";
import type { Locale } from "@/i18n/config";
import { cn } from "@/utils/common";
import {
  buildPaginatedPostsInitialData,
  type PaginatedPostsData,
  shouldHidePagination,
} from "@/utils/post-pagination";
import AppPostGridSkeleton from "./app-post-grid-skeleton";

const DEFAULT_PAGE_SIZE = 12;

type BasePostGridPaginatedProps = {
  pageSize?: number;
  className?: string;
  skipSlug?: string;
  posts?: AppPost[];
  initialData?: PaginatedPostsData;
  /**
   * If true (default), synchronizes the current page with URL search params (e.g. ?page=2).
   */
  syncWithQueryParam?: boolean;
  /**
   * Query parameter name to bind to (defaults to "page").
   */
  queryParamName?: string;
};

type AppPostGridPaginatedProps = BasePostGridPaginatedProps &
  (
    | {
        hiddenTags: string[];
        publicTag?: never;
      }
    | {
        hiddenTags?: never;
        publicTag: string;
      }
  );

function resolveActivePage(
  syncWithQueryParam: boolean,
  queryPage: string | null | undefined,
  localPage: number,
): number {
  if (!syncWithQueryParam) return localPage;
  const parsedQueryPage = queryPage ? Number.parseInt(queryPage, 10) : 1;
  return !Number.isNaN(parsedQueryPage) && parsedQueryPage > 0
    ? parsedQueryPage
    : 1;
}

function buildPostGridQueryOptions(params: {
  publicTag?: string;
  hiddenTags?: string[];
  page: number;
  locale: Locale;
  skipSlug?: string;
  pageSize: number;
}) {
  const { publicTag, hiddenTags, page, locale, skipSlug, pageSize } = params;

  if (publicTag === undefined) {
    return {
      queryKey: [
        "fetchPostsByHiddenTags",
        hiddenTags,
        page,
        locale,
        skipSlug,
        pageSize,
      ],
      queryFn: () =>
        fetchPostsByHiddenTags(hiddenTags ?? [], {
          limit: pageSize,
          page,
          skipSlug,
          locale,
        }),
    };
  }

  return {
    queryKey: [
      "fetchPostsByPublicTag",
      publicTag,
      page,
      locale,
      skipSlug,
      pageSize,
    ],
    queryFn: () =>
      fetchPostsByPublicTag(publicTag, {
        limit: pageSize,
        page,
        skipSlug,
        locale,
      }),
  };
}

function scrollContainerIntoViewIfAboveFold(
  container: HTMLDivElement | null,
): void {
  if (!container) return;
  const rect = container.getBoundingClientRect();
  if (rect.top < 0) {
    container.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

/**
 * Inner component to read searchParams and handle pagination state.
 */
function AppPostGridPaginatedContent(props: AppPostGridPaginatedProps) {
  const {
    pageSize = DEFAULT_PAGE_SIZE,
    posts: initialPosts,
    initialData,
    hiddenTags,
    publicTag,
    skipSlug,
    className,
    syncWithQueryParam = true,
    queryParamName = "page",
  } = props;

  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);

  // Local state as fallback when query params are disabled
  const [localPage, setLocalPage] = useState(1);

  const page = resolveActivePage(
    syncWithQueryParam,
    searchParams?.get(queryParamName),
    localPage,
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (syncWithQueryParam && searchParams) {
        const params = new URLSearchParams(searchParams.toString());
        if (newPage <= 1) {
          params.delete(queryParamName);
        } else {
          params.set(queryParamName, newPage.toString());
        }
        const queryString = params.toString();
        router.push(queryString ? `${pathname}?${queryString}` : pathname, {
          scroll: false,
        });
      } else {
        setLocalPage(newPage);
      }

      // Smoothly scroll to the top of the container to prevent abrupt jumping
      scrollContainerIntoViewIfAboveFold(containerRef.current);
    },
    [syncWithQueryParam, searchParams, queryParamName, pathname, router],
  );

  const queryOptions = buildPostGridQueryOptions({
    publicTag,
    hiddenTags,
    page,
    locale,
    skipSlug,
    pageSize,
  });

  const queryInitialData = buildPaginatedPostsInitialData({
    page,
    initialData,
    posts: initialPosts,
  });

  const { data, error, isError, isPending, isFetched, isFetching } = useQuery({
    ...queryOptions,
    placeholderData: keepPreviousData,
    initialData: queryInitialData,
  });

  const posts = data?.posts ?? [];
  const hasMore = data?.hasMore ?? false;
  const totalPages = data?.totalPages ?? 1;
  const hidePagination = shouldHidePagination({ hasMore, totalPages, page });
  const isInitialLoading = !isFetched && isPending;

  return (
    <div ref={containerRef} className={cn("space-y-2", className)}>
      <div
        className={cn(
          "min-h-[320px] transition-opacity duration-200",
          isFetching && "opacity-60",
        )}
      >
        {isInitialLoading ? (
          <AppPostGridSkeleton count={pageSize} />
        ) : isError ? (
          <p className="text-red-500">Error: {error.message}</p>
        ) : (
          <AppPostGrid posts={posts} />
        )}
      </div>

      {data && !hidePagination && (
        <PaginationPanel
          className="mt-4 md:mt-8"
          totalPages={data.totalPages}
          page={data.page}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default function AppPostGridPaginated(props: AppPostGridPaginatedProps) {
  return (
    <Suspense
      fallback={
        <AppPostGridSkeleton count={props.pageSize || DEFAULT_PAGE_SIZE} />
      }
    >
      <AppPostGridPaginatedContent {...props} />
    </Suspense>
  );
}
