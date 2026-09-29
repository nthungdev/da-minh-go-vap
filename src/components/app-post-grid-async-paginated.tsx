"use client";

import { fetchPostsByHiddenTags, fetchPostsByPublicTag } from "@/actions/post";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Suspense, useCallback, useRef, useState } from "react";
import AppPostGridSkeleton from "./app-post-grid-skeleton";
import { AppPost } from "@/definitions";
import { useLocale } from "next-intl";
import AppPostGrid from "@/components/app-post-grid";
import PaginationPanel from "@/components/pagination-panel";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/utils/common";

const DEFAULT_PAGE_SIZE = 12;

type BasePostGridPaginatedProps = {
  pageSize?: number;
  className?: string;
  skipSlug?: string;
  posts?: AppPost[];
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

/**
 * Inner component to read searchParams and handle pagination state.
 */
function AppPostGridPaginatedContent(props: AppPostGridPaginatedProps) {
  const {
    pageSize = DEFAULT_PAGE_SIZE,
    posts: initialPosts,
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

  // Determine active page from query params if enabled
  const queryPage = searchParams?.get(queryParamName);
  const parsedQueryPage = queryPage ? parseInt(queryPage, 10) : 1;
  const page = syncWithQueryParam
    ? !isNaN(parsedQueryPage) && parsedQueryPage > 0
      ? parsedQueryPage
      : 1
    : localPage;

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
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.top < 0) {
          containerRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    },
    [syncWithQueryParam, searchParams, queryParamName, pathname, router],
  );

  const queryOptions =
    publicTag === undefined
      ? {
          queryKey: [
            "fetchPostsByHiddenTags",
            hiddenTags,
            page,
            locale,
            skipSlug,
          ],
          queryFn: () =>
            fetchPostsByHiddenTags(hiddenTags, {
              limit: pageSize,
              page,
              skipSlug,
              locale,
            }),
        }
      : {
          queryKey: [
            "fetchPostsByPublicTag",
            publicTag,
            page,
            locale,
            skipSlug,
          ],
          queryFn: () =>
            fetchPostsByPublicTag(publicTag, {
              limit: pageSize,
              page,
              skipSlug,
              locale,
            }),
        };

  const { data, error, isError, isPending, isFetched, isFetching } = useQuery({
    ...queryOptions,
    placeholderData: keepPreviousData,
    initialData:
      initialPosts && initialPosts.length > 0 && page === 1
        ? {
            posts: initialPosts,
            hasMore: false,
            totalPages: 1,
            page: 1,
          }
        : undefined,
  });

  if (!data) return null;

  const { posts, hasMore } = data;
  const hidePagination = !hasMore && page === 1;
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

      {!hidePagination && (
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
