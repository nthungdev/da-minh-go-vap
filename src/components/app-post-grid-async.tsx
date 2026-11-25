"use client";

import { useQuery } from "@tanstack/react-query";
import { CircleAlert } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { fetchPostsByHiddenTags } from "@/actions/post";
import AppGridHeader from "@/components/app-grid-header";
import AppPostGrid from "@/components/app-post-grid";
import type { AppPost } from "@/definitions";
import { cn } from "@/utils/common";
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
  const { data, isError, isPending, refetch } = useQuery({
    queryKey: ["fetchPostsByHiddenTags", hiddenTags, locale, limit],
    queryFn: () =>
      fetchPostsByHiddenTags(hiddenTags, {
        locale,
        limit,
      }),
    initialData: queryInitialData,
  });

  const posts = data?.posts ?? queryInitialData?.posts ?? [];
  if (isPending) return <AppPostGridSkeleton count={limit} />;

  if (isError && !posts.length) {
    return <PostQueryFeedback onRetry={() => void refetch()} />;
  }

  const hasMore = data?.hasMore ?? false;
  const jointHiddenTags = hiddenTags.join(",");
  const viewMoreHref = `/posts?ht=${encodeURIComponent(jointHiddenTags)}&ti=${encodeURIComponent(title)}`;

  const shouldShowViewMore = showViewMore && hasMore;

  return (
    <div className="space-y-2">
      <AppGridHeader text={title} />
      {posts.length > 0 ? (
        <AppPostGrid hidePostTitles={hidePostTitles} posts={posts} />
      ) : (
        <PostQueryFeedback />
      )}
      {shouldShowViewMore && (
        <div className="flex flex-row justify-end">
          <AppViewMoreLink href={viewMoreHref} />
        </div>
      )}
    </div>
  );
}

export function PostQueryFeedback({
  onRetry,
  showBrowseAll,
}: {
  onRetry?: () => void;
  showBrowseAll?: boolean;
}) {
  const t = useTranslations();
  const actionClass =
    "inline-flex min-h-10 items-center rounded-md bg-primary-800 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-900 focus-visible:ring-2 focus-visible:ring-primary-800 focus-visible:ring-offset-2 focus-visible:outline-none";

  return (
    <div
      role={onRetry ? "alert" : undefined}
      className="space-y-3 rounded-md border border-gray-200 bg-white p-4 text-center"
    >
      <div
        className={cn(
          "flex items-center justify-center gap-2 font-semibold",
          onRetry ? "text-red-700" : "text-gray-900",
        )}
      >
        {onRetry && (
          <CircleAlert aria-hidden="true" className="size-5 shrink-0" />
        )}
        <p>{t(onRetry ? "posts.errorTitle" : "posts.emptyTitle")}</p>
      </div>
      <p className="text-sm text-gray-700">
        {t(onRetry ? "posts.errorDescription" : "posts.emptyDescription")}
      </p>
      {onRetry && (
        <button type="button" className={actionClass} onClick={onRetry}>
          {t("common.retry")}
        </button>
      )}
      {showBrowseAll && (
        <Link href="/" className={actionClass}>
          {t("posts.browseAll")}
        </Link>
      )}
    </div>
  );
}
