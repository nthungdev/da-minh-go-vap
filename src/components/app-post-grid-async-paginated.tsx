"use client";

import { fetchPostsByHiddenTags } from "@/actions/post";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { HTMLAttributes, useState } from "react";
import AppPostGridSkeleton from "./app-post-grid-skeleton";
import { AppPost } from "@/definitions";
import { useLocale } from "next-intl";
import AppPostGrid from "@/components/app-post-grid";
import { IoIosSkipBackward, IoIosSkipForward } from "react-icons/io";
import {
  MdOutlineArrowBackIosNew,
  MdOutlineArrowForwardIos,
} from "react-icons/md";
import { twMerge } from "tailwind-merge";

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

interface PaginationPanel extends HTMLAttributes<HTMLDivElement> {
  totalPages: number;
  page: number;
  onPageChange?: (page: number) => void;
}

function PaginationPanel({
  totalPages,
  page,
  className,
  onPageChange,
}: PaginationPanel) {
  const allPages = Array(totalPages)
    .fill(null)
    .map((_, index) => index + 1);
  const shownPages = allPages.slice(Math.max(page - 3, 0), page + 2);

  return (
    <div className={twMerge("flex flex-row justify-center gap-x-1", className)}>
      <button
        className="text-primary rounded-md border px-3 py-1 hover:cursor-pointer disabled:text-black disabled:hover:cursor-auto"
        onClick={() => onPageChange?.(page - 1)}
        disabled={page <= 1}
      >
        <MdOutlineArrowBackIosNew />
      </button>
      <button
        className="text-primary rounded-md border px-3 py-1 hover:cursor-pointer disabled:text-black disabled:hover:cursor-auto"
        disabled={page <= 1}
        onClick={() => onPageChange?.(1)}
      >
        <IoIosSkipBackward />
      </button>
      {shownPages.map((p) => (
        <button
          key={p}
          className={
            "text-primary rounded-md border px-3 py-1 hover:cursor-pointer disabled:text-black disabled:hover:cursor-auto"
          }
          disabled={p === page}
          onClick={() => onPageChange?.(p)}
        >
          {p}
        </button>
      ))}
      <button
        className="text-primary rounded-md border px-3 py-1 hover:cursor-pointer disabled:text-black disabled:hover:cursor-auto"
        disabled={page >= totalPages}
        onClick={() => onPageChange?.(totalPages)}
      >
        <IoIosSkipForward />
      </button>
      <button
        className="text-primary rounded-md border px-3 py-1 hover:cursor-pointer disabled:text-black disabled:hover:cursor-auto"
        onClick={() => onPageChange?.(page + 1)}
        disabled={page >= totalPages}
      >
        <MdOutlineArrowForwardIos />
      </button>
    </div>
  );
}
