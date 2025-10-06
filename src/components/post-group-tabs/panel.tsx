"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import { Page } from "@/payload-types";
import AppViewMoreLink from "@/components/app-view-more-link";
import { getDataOrUndefined } from "@/payload/utils/data";
import { fetchPostsByHiddenTags } from "@/actions/post";
import { useQuery } from "@tanstack/react-query";
import { makePostsPath } from "@/utils/post";
import Spinner from "@/components/spinner";
import { useLocale } from "next-intl";
import PostList from "@/components/post-list";
import Image from "next/image";
import Link from "next/link";

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
      <div className="flex aspect-video items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    // TODO prettier error
    return <div>Error</div>;
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
      <div className="flex flex-col gap-x-4 lg:flex-row lg:p-1">
        <Link href={firstPostHref} className="block space-y-2 lg:w-3/5 lg:p-2">
          <div className="relative aspect-video w-full">
            {firstPostThumbnail && firstPostThumbnail.url ? (
              <Image
                className="object-cover"
                src={firstPostThumbnail.url}
                alt={firstPost.title}
                sizes="50vw"
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
