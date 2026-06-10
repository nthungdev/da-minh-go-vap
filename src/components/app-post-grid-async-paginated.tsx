"use client";

import { fetchPostsByHiddenTags, fetchPostsByPublicTag } from "@/actions/post";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import AppPostGridSkeleton from "./app-post-grid-skeleton";
import { AppPost } from "@/definitions";
import { useLocale } from "next-intl";
import AppPostGrid from "@/components/app-post-grid";
import PaginationPanel from "@/components/pagination-panel";

const DEFAULT_PAGE_SIZE = 12;

type AppPostGridPaginatedProps =
  | {
      hiddenTags: string[];
      publicTag?: never;
      pageSize?: number;
      className?: string;
      skipSlug?: string;
      posts?: AppPost[];
    }
  | {
      hiddenTags?: never;
      publicTag: string;
      pageSize?: number;
      className?: string;
      skipSlug?: string;
      posts?: AppPost[];
    };

export default function AppPostGridPaginated({
  pageSize = DEFAULT_PAGE_SIZE,
  posts: initialPosts,
  hiddenTags,
  publicTag,
  skipSlug,
}: AppPostGridPaginatedProps) {
  const locale = useLocale();
  const [page, setPage] = useState(1);

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
              skipSlug: skipSlug,
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
              skipSlug: skipSlug,
              locale,
            }),
        };

  const { data, error, isError, isPending, isFetched, isFetching } = useQuery({
    ...queryOptions,
    placeholderData: keepPreviousData,
    initialData: {
      posts: initialPosts || [],
      hasMore: false,
      totalPages: 1,
      page: 1,
    },
  });

  if (!data) return undefined;

  const { posts, hasMore } = data;
  const hidePagination = !hasMore && page === 1;

  return (
    <div className="space-y-2">
      {isPending || isFetching || !isFetched ? (
        <AppPostGridSkeleton count={pageSize} />
      ) : isError ? (
        <p>Error: {error.message}</p>
      ) : (
        <AppPostGrid posts={posts} />
      )}

      {!hidePagination && (
        <PaginationPanel
          className="mt-4 md:mt-8"
          totalPages={data.totalPages}
          page={data.page}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
