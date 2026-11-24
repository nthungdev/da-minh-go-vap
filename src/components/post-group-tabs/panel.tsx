"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type React from "react";
import { fetchPostsByHiddenTags } from "@/actions/post";
import { PostQueryFeedback } from "@/components/app-post-grid-async";
import AppViewMoreLink from "@/components/app-view-more-link";
import PostList from "@/components/post-list";
import type { AppPost } from "@/definitions";
import { getDataOrUndefined } from "@/payload/utils/data";
import type { Page } from "@/payload-types";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";
import { formatShortDate } from "@/utils/date";
import { makePostsPath } from "@/utils/post";

const POST_COUNT = 6;
const SKELETON_LIST_KEYS = [
  "skeleton-1",
  "skeleton-2",
  "skeleton-3",
  "skeleton-4",
  "skeleton-5",
] as const;

interface PostGroupTabsPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  component?: React.ElementType;
  title: string;
  hiddenTags: string[];
  initialPosts?: AppPost[];
  viewMoreButton?: {
    enable: boolean;
    relativeUrl: Page | string | undefined | null;
  };
}

export default function PostGroupTabsPanel({
  className,
  hiddenTags,
  viewMoreButton,
  title,
  initialPosts,
  hidden,
  ...props
}: PostGroupTabsPanelProps) {
  const locale = useLocale();
  const { isPending, isError, data, refetch } = useQuery({
    queryKey: ["tabbed-post-group-content", ...hiddenTags, locale],
    queryFn: () =>
      fetchPostsByHiddenTags(hiddenTags, { limit: POST_COUNT, locale }),
    enabled: !hidden,
    initialData: initialPosts
      ? {
          posts: initialPosts,
          hasMore: false,
          page: 1,
          totalPages: 1,
        }
      : undefined,
  });

  if (isPending && !initialPosts?.length) {
    return (
      <PostGroupTabPanelSkeleton
        className={className}
        aria-busy={!hidden}
        viewMoreButtonEnable={Boolean(viewMoreButton?.enable)}
        hidden={hidden}
        {...props}
      />
    );
  }

  const posts = data?.posts ?? initialPosts ?? [];
  const [firstPost, ...otherPosts] = posts;
  if (!firstPost) {
    return (
      <div className={className} hidden={hidden} {...props}>
        <PostQueryFeedback
          onRetry={isError ? () => void refetch() : undefined}
        />
      </div>
    );
  }

  const page = getDataOrUndefined<Page>(viewMoreButton?.relativeUrl);
  const viewMoreHref = page ? page.path : makePostsPath(hiddenTags, title);
  const firstPostThumbnail = getDataOrUndefined(firstPost.thumbnail);
  const firstPostDate = formatShortDate(firstPost.publishedAt, locale);
  const firstPostHref = `/posts/${firstPost.slug}`;

  return (
    <div className={cn(className)} hidden={hidden} {...props}>
      <div className="flex flex-col gap-x-4 gap-y-4 lg:flex-row lg:p-3">
        <Link
          href={firstPostHref}
          className="block space-y-2 rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:w-3/5"
        >
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            {firstPostThumbnail?.url ? (
              <Image
                unoptimized
                className="object-cover"
                src={transformUrl(firstPostThumbnail.url, { width: "600" })}
                alt={firstPost.title}
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 66vw"
                fill
              />
            ) : (
              <div className="size-full bg-gray-300"></div>
            )}
          </div>
          <div className="text-sm font-semibold text-gray-600">
            {firstPostDate}
          </div>
          <div className="text-lg font-bold">{firstPost.title}</div>
          <p className="line-clamp-3">{firstPost.shortBody}</p>
        </Link>
        <PostList className="lg:flex-1" posts={otherPosts} effectOnHover />
      </div>
      {!!viewMoreButton?.enable && (
        <div className="flex flex-row justify-end">
          <AppViewMoreLink href={viewMoreHref} />
        </div>
      )}
    </div>
  );
}

function PostGroupTabPanelSkeleton({
  viewMoreButtonEnable,
  className,
  ...props
}: {
  viewMoreButtonEnable: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  const t = useTranslations("common");
  return (
    <div className={cn("motion-safe:animate-pulse", className)} {...props}>
      <span className="sr-only">{t("loading")}</span>
      <div className="flex flex-col gap-x-4 lg:flex-row lg:p-3">
        <div className="block space-y-2 gap-y-2 lg:w-3/5">
          <div className="relative aspect-video w-full bg-gray-200"></div>
          <div className="h-6 bg-gray-200 text-sm font-semibold"></div>
          <div className="h-6 bg-gray-200 text-lg font-bold"></div>
          <p className="line-clamp-3 h-20 bg-gray-200"></p>
        </div>
        <div className="flex-1 space-y-2">
          {SKELETON_LIST_KEYS.map((skeletonKey) => (
            <div
              key={skeletonKey}
              className="flex w-full flex-row gap-x-3 bg-gray-200"
            >
              <div className="aspect-video w-32 bg-gray-200 md:w-40 lg:w-28"></div>
              <div className="flex-1 bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
      {viewMoreButtonEnable && (
        <div className="mx-3 flex h-8 bg-gray-200"></div>
      )}
    </div>
  );
}
