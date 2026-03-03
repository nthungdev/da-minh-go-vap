"use client";

import { fetchPostsByHiddenTags } from "@/actions/post";
import AppGridHeader from "@/components/app-grid-header";
import AppPostGrid from "@/components/app-post-grid";
import { AppPost } from "@/definitions";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import AppPostGridSkeleton from "./app-post-grid-skeleton";
import AppViewMoreLink from "./app-view-more-link";

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
}: AppPostGridProps) {
  const locale = useLocale();
  const { data, error, isPending, isLoading } = useQuery({
    queryKey: ["fetchPostsByHiddenTags", hiddenTags, locale],
    queryFn: () =>
      fetchPostsByHiddenTags(hiddenTags, {
        locale,
        limit,
      }),
    initialData: initialPosts
      ? {
          posts: initialPosts,
          hasMore: false,
          page: 1,
          totalPages: 1,
        }
      : undefined,
  });

  if (isPending || isLoading) return <AppPostGridSkeleton count={limit} />;

  if (error) return <p>Error: {error.message}</p>;

  const { posts, hasMore } = data;
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
