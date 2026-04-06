"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import { Page } from "@/payload-types";
import AppViewMoreLink from "@/components/app-view-more-link";
import { getDataOrUndefined } from "@/payload/utils/data";
import { fetchPostsByHiddenTags } from "@/actions/post";
import { useQuery } from "@tanstack/react-query";
import { makePostsPath } from "@/utils/post";
import { useLocale } from "next-intl";
import PostList from "@/components/post-list";
import Image from "next/image";
import Link from "next/link";
import { transformUrl } from "@/utils/cloudflare";

const POST_COUNT = 6;

interface PostGroupTabsPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  component?: React.ElementType;
  title: string;
  hiddenTags: string[];
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
  ...props
}: PostGroupTabsPanelProps) {
  const locale = useLocale();
  const { isPending, error, data } = useQuery({
    queryKey: ["tabbed-post-group-content", ...hiddenTags, locale],
    queryFn: () =>
      fetchPostsByHiddenTags(hiddenTags, { limit: POST_COUNT, locale }),
  });

  if (isPending) {
    return (
      <PostGroupTabPanelSkeleton
        viewMoreButtonEnable={viewMoreButton?.enable || true}
        {...props}
      />
    );
  }

  if (error) {
    // TODO prettier error
    return <div {...props}>Error</div>;
  }

  const page = getDataOrUndefined<Page>(viewMoreButton?.relativeUrl);

  const viewMoreHref = page ? page.path : makePostsPath(hiddenTags, title);

  const firstPost = data.posts[0];
  const otherPosts = data.posts.slice(1);

  if (!firstPost) return null;

  const firstPostThumbnail = getDataOrUndefined(firstPost.thumbnail);
  const firstPostDate = firstPost.publishedAt.toLocaleDateString("vi-VN");
  const firstPostHref = `/posts/${firstPost.slug}`;

  return (
    <div className={twMerge(className)} {...props}>
      <div className="flex flex-col gap-x-4 lg:flex-row lg:p-3">
        <Link href={firstPostHref} className="block space-y-2 lg:w-3/5">
          <div className="relative aspect-video w-full">
            {firstPostThumbnail && firstPostThumbnail.url ? (
              <Image
                className="object-cover"
                src={transformUrl(firstPostThumbnail.url, { width: "600" })}
                alt={firstPost.title}
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
  return (
    <div className={twMerge("animate-pulse", className)} {...props}>
      <div className="flex flex-col gap-x-4 lg:flex-row lg:p-3">
        <div className="block space-y-2 gap-y-2 lg:w-3/5">
          <div className="relative aspect-video w-full bg-gray-200"></div>
          <div className="h-6 bg-gray-200 text-sm font-semibold"></div>
          <div className="h-6 bg-gray-200 text-lg font-bold"></div>
          <p className="line-clamp-3 h-20 bg-gray-200"></p>
        </div>
        <div className="flex-1 space-y-2">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
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
