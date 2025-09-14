"use client";

import React from "react";
import AppPostGrid from "./app-post-grid";
import { twMerge } from "tailwind-merge";
import { Page } from "@/payload-types";
import AppViewMoreLink from "@/components/app-view-more-link";
import { getDataOrUndefined } from "@/payload/utils/data";
import { fetchPostsByHiddenTags } from "@/actions/post";
import { useQuery } from "@tanstack/react-query";
import { makePostsPath } from "@/utils/post";

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
  const { isPending, error, data } = useQuery({
    queryKey: ["app-post-tab-content", ...hiddenTags],
    queryFn: () => fetchPostsByHiddenTags(hiddenTags, { limit: POST_COUNT }),
  });

  if (isPending) {
    return (
      <div className="flex aspect-video items-center justify-center">
        <div
          className="inline-block size-6 animate-spin rounded-full border-3 border-current border-t-transparent text-blue-600 dark:text-blue-500"
          role="status"
          aria-label="loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    // TODO prettier error
    return <div>Error</div>;
  }

  const DataComponent = component ? component : AppPostGrid;
  const page = getDataOrUndefined<Page>(viewMoreButton?.relativeUrl);

  const viewMoreHref = page ? page.path : makePostsPath(hiddenTags, title);

  return (
    <div className={twMerge("space-y-2", className)} {...props}>
      <DataComponent className="lg:grid-cols-3" posts={data.posts} />
      {!!viewMoreButton?.enable && (
        <div className="flex flex-row justify-end">
          <AppViewMoreLink href={viewMoreHref} />
        </div>
      )}
    </div>
  );
}
