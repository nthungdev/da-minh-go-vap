"use client";

import { fetchPostsByHiddenTags } from "@/actions/post";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import AppPostGridSkeleton from "./app-post-grid-skeleton";
import { AppPost } from "@/definitions";
import { useLocale } from "next-intl";
import AppPostGrid from "@/components/app-post-grid";

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
  className,
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

  function incrementPage() {
    setPage((prevPage) => prevPage + 1);
  }

  function decrementPage() {
    setPage((prevPage) => Math.max(prevPage - 1, 0));
  }

  if (!data) return undefined;

  const { posts, hasMore } = data;
  const hidePagination = !hasMore && page === 1;

  const disablePreviousPage = isFetching || page === 1;
  const disableNextPage = isFetching || !hasMore;

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
        <div className="flex flex-row justify-end">
          <button
            className="bg-primary-50 text-primary-700 disabled:bg-primary-50 disabled:text-primary-700 hover:bg-primary-50 hover:text-primary-600 rounded-l-lg border px-3 py-1 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disablePreviousPage}
            onClick={decrementPage}
          >
            Quay lại
          </button>

          <button
            className="bg-primary-1 text-primary-700 disabled:bg-primary-50 disabled:text-primary-700 hover:bg-primary-50 hover:text-primary-600 rounded-r-lg border px-3 py-1 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disableNextPage}
            onClick={incrementPage}
          >
            Xem tiếp
          </button>
        </div>
      )}
    </div>
  );
}
