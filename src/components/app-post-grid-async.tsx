"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { fetchPostsByHiddenTags } from "@/actions/post";
import AppGridHeader from "@/components/app-grid-header";
import AppPostGrid from "@/components/app-post-grid";
import type { AppPost } from "@/definitions";
import {
  buildPostGroupInitialData,
  type PaginatedPostsData,
} from "@/utils/post-pagination";
import AppPostGridSkeleton from "./app-post-grid-skeleton";
import AppViewMoreLink from "./app-view-more-link";

interface AppPostGridProps {
  hiddenTags: string[];
  limit: number;
  title: string;
  posts?: AppPost[];
  initialData?: PaginatedPostsData;
  showViewMore?: boolean;
  hidePostTitles?: boolean;
  className?: string;
}

export default function AppPostGridAsync({
  hiddenTags,
  limit,
  title,
  posts: initialPosts,
  initialData,
  showViewMore,
  hidePostTitles,
}: AppPostGridProps) {
  const queryInitialData = buildPostGroupInitialData({
    initialData,
    posts: initialPosts,
  });
  const locale = useLocale();
  const { data, error, isPending, isLoading } = useQuery({
    queryKey: ["fetchPostsByHiddenTags", hiddenTags, locale, limit],
    queryFn: () =>
      fetchPostsByHiddenTags(hiddenTags, {
        locale,
        limit,
      }),
    initialData: queryInitialData,
  });

  const hasInitialPosts = Boolean(queryInitialData?.posts.length);

  if ((isPending || isLoading) && !hasInitialPosts)
    return <AppPostGridSkeleton count={limit} />;

  if (error && !hasInitialPosts) return <p>Error: {error.message}</p>;

  const posts = data?.posts ?? queryInitialData?.posts ?? [];
  const hasMore = data?.hasMore ?? false;
  const jointHiddenTags = hiddenTags.join(",");
  const viewMoreHref = `/posts?ht=${encodeURIComponent(jointHiddenTags)}&ti=${encodeURIComponent(title)}`;

  const shouldShowViewMore = showViewMore && hasMore;

  return (
    <div className="space-y-2">
      <AppGridHeader text={title} />
      <AppPostGrid hidePostTitles={hidePostTitles} posts={posts} />
      {shouldShowViewMore && (
        <div className="flex flex-row justify-end">
          <AppViewMoreLink href={viewMoreHref} />
        </div>
      )}
    </div>
  );
}
