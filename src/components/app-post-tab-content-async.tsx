"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import type React from "react";
import { fetchPostsByHiddenTags } from "@/actions/post";
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
  const { isPending, error, data } = useQuery({
    queryKey: ["app-post-tab-content", ...hiddenTags, locale],
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
