"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import type React from "react";
import { fetchPostsByHiddenTags } from "@/actions/post";
import { PostQueryFeedback } from "@/components/app-post-grid-async";
import AppViewMoreLink from "@/components/app-view-more-link";
import Spinner from "@/components/spinner";
import { getDataOrUndefined } from "@/payload/utils/data";
import type { Page } from "@/payload-types";
import { cn } from "@/utils/common";
import { makePostsPath } from "@/utils/post";
import AppPostGrid from "./app-post-grid";

const POST_COUNT = 6;

interface AppPostTabContentAsyncProps
  extends React.HTMLAttributes<HTMLDivElement> {
  component?: React.ElementType;
  title: string;
  hiddenTags: string[];
  viewMoreButton?: {
    enable: boolean;
    relativeUrl: Page | string | undefined | null;
  };
}

export default function AppPostTabContentAsync({
  className,
  component,
  hiddenTags,
  viewMoreButton,
  title,
  ...props
}: AppPostTabContentAsyncProps) {
  const locale = useLocale();
  const { isPending, isError, data, refetch } = useQuery({
    queryKey: ["app-post-tab-content", ...hiddenTags, locale],
    queryFn: () =>
      fetchPostsByHiddenTags(hiddenTags, { limit: POST_COUNT, locale }),
  });

  if (isPending) {
    return (
      <div
        role="status"
        aria-busy="true"
        className={cn(
          "flex aspect-video items-center justify-center",
          className,
        )}
        {...props}
      >
        <Spinner className="motion-reduce:animate-none" />
      </div>
    );
  }

  if (isError || data.posts.length === 0) {
    return (
      <div className={className} {...props}>
        <PostQueryFeedback
          onRetry={isError ? () => void refetch() : undefined}
        />
      </div>
    );
  }

  const DataComponent = component ?? AppPostGrid;
  const page = getDataOrUndefined<Page>(viewMoreButton?.relativeUrl);

  const viewMoreHref = page ? page.path : makePostsPath(hiddenTags, title);

  return (
    <div className={cn("space-y-2", className)} {...props}>
      <DataComponent className="lg:grid-cols-3" posts={data.posts} />
      {!!viewMoreButton?.enable && (
        <div className="flex flex-row justify-end">
          <AppViewMoreLink href={viewMoreHref} />
        </div>
      )}
    </div>
  );
}
