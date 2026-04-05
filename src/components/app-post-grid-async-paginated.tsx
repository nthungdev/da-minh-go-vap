"use client";

import { fetchPostsByHiddenTags } from "@/actions/post";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import AppPostGridSkeleton from "./app-post-grid-skeleton";
import { AppPost } from "@/definitions";
import { useLocale } from "next-intl";
import AppPostGrid from "@/components/app-post-grid";
import PaginationPanel from "@/components/pagination-panel";

const DEFAULT_PAGE_SIZE = 12;

interface AppPostGridPaginatedProps {
  hiddenTags: string[];
  pageSize?: number;
  className?: string;
  skipSlug?: string;
  posts?: AppPost[];
}

export default function AppPostGridPaginated({
  hiddenTags,
  pageSize = DEFAULT_PAGE_SIZE,
  skipSlug,
  posts: initialPosts,
}: AppPostGridPaginatedProps) {
  const locale = useLocale();
  const [page, setPage] = useState(1);

  const { data, error, isError, isPending, isFetched, isFetching } = useQuery({
    queryKey: ["fetchPostsByHiddenTags", hiddenTags, page, locale],
    queryFn: () =>
      fetchPostsByHiddenTags(hiddenTags, {
        limit: pageSize,
        page,
        skipSlug,
        locale,
      }),
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
