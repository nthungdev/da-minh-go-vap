"use client";

import { fetchPostsByHiddenTags } from "@/actions/post";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import AppViewMoreLink from "./app-view-more-link";
import AppPostGridSkeleton from "./app-post-grid-skeleton";
import { AppPost } from "@/definitions";
import AppGridHeader from "@/components/app-grid-header";
import { useLocale } from "next-intl";
import { twMerge } from "tailwind-merge";
import AppPostGrid from "@/components/app-post-grid";

interface AppPostGridProps {
  hiddenTags: string[];
  limit: number;
  title: string;
  posts?: AppPost[];
  showViewMore?: boolean;
  hidePostTitles?: boolean;
  className?: string;
}

export default function AppPostGridAsync({
  hiddenTags,
  limit,
  title,
  posts: initialPosts,
  showViewMore,
  hidePostTitles,
  className,
}: AppPostGridProps) {
  const locale = useLocale();
  const { data, error, isPending } = useQuery({
    queryKey: ["fetchPostsByHiddenTags", hiddenTags, locale],
    queryFn: () =>
      fetchPostsByHiddenTags(hiddenTags, {
        locale,
        limit,
      }),
    initialData: {
      posts: initialPosts || [],
      hasMore: false,
      page: 1,
      totalPages: 1,
    },
  });

  if (isPending) return <AppPostGridSkeleton count={limit} />;

  if (error) return <p>Error: {error.message}</p>;

  const { posts, hasMore } = data;
  const jointHiddenTags = hiddenTags.join(",");
  const viewMoreHref = `/posts?ht=${encodeURIComponent(jointHiddenTags)}&ti=${encodeURIComponent(title)}`;

  const shouldShowViewMore = showViewMore && hasMore;

  return (
    <div className="space-y-2">
      <AppGridHeader text={title} />
      <AppPostGrid posts={posts} />
      {shouldShowViewMore && (
        <div className="flex flex-row justify-end">
          <AppViewMoreLink href={viewMoreHref} />
        </div>
      )}
    </div>
  );
}
