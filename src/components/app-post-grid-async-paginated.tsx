"use client";

import { fetchPostsByHiddenTags } from "@/actions/post";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import AppPostGridSkeleton from "./app-post-grid-skeleton";
import { AppPost } from "@/definitions";

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
  posts,
}: AppPostGridPaginatedProps) {
  const [page, setPage] = useState(0);

  const fetchPosts = async (offset: number) => {
    return await fetchPostsByHiddenTags(hiddenTags, {
      limit: pageSize,
      offset: offset * pageSize,
      skipSlug,
    });
  };

  const { data, error, isError, isPending, isFetched, isFetching } = useQuery({
    queryKey: ["fetchPostsByHiddenTags", hiddenTags, page],
    queryFn: () => fetchPosts(page),
    placeholderData: keepPreviousData,
    initialData: { posts: posts || [], hasMore: false },
  });

  if (data) {
    const { posts, hasMore } = data;
    const hidePagination = !hasMore && page === 0;

    return (
      <div className="space-y-2">
        {isPending || isFetching || !isFetched ? (
          <AppPostGridSkeleton count={DEFAULT_PAGE_SIZE} />
        ) : isError ? (
          <p>Error: {error.message}</p>
        ) : (
          <ul
            className={`relative grid grid-flow-row md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
          >
            {posts.map((post, index) => (
              // min-w-0 to override min-width: min-content that cause post title to not be truncated
              <li
                className="block w-full min-w-0 bg-white hover:ring border border-transparent"
                key={index}
              >
                <Link
                  href={`/posts/${post.slug}`}
                  className="block overflow-hidden border"
                >
                  <div className="relative aspect-video">
                    {typeof post.thumbnail !== "string" &&
                      typeof post.thumbnail.url === "string" && (
                        <Image
                          className="object-cover"
                          src={post.thumbnail.url}
                          fill
                          sizes="100%"
                          alt={`${post.title}'s thumbnail`}
                        />
                      )}
                  </div>
                  <div className="p-2 space-y-2">
                    <h2 className="text-center block text-xl truncate">
                      {post.title}
                    </h2>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {!hidePagination && (
          <div className="flex flex-row justify-end">
            <button
              className="bg-primary-50 py-1 px-3 rounded-l-lg border text-primary-700 disabled:opacity-50 disabled:bg-primary-50 disabled:text-primary-700 disabled:cursor-not-allowed hover:bg-primary-50 hover:text-primary-600"
              disabled={isFetching || page === 0}
              onClick={() => {
                setPage((page) => page - 1);
              }}
            >
              Quay lại
            </button>

            <button
              className="bg-primary-1 py-1 px-3 rounded-r-lg border text-primary-700 disabled:opacity-50 disabled:bg-primary-50 disabled:text-primary-700 disabled:cursor-not-allowed hover:bg-primary-50 hover:text-primary-600"
              disabled={isFetching || !hasMore}
              onClick={() => {
                setPage((page) => page + 1);
              }}
            >
              Xem tiếp
            </button>
          </div>
        )}
      </div>
    );
  }
}
