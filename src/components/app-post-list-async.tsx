"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { fetchPostsByHiddenTags } from "@/actions/post";
import AppPostCard from "@/components/app-post-card";
import { PostQueryFeedback } from "@/components/app-post-grid-async";
import AppSectionHeader from "@/components/app-section-header";
import type { AppPost } from "@/definitions";
import {
  buildPostGroupInitialData,
  type PaginatedPostsData,
} from "@/utils/post-pagination";

interface AppPostListAsyncProps {
  hiddenTags: string[];
  limit: number;
  title?: string;
  posts?: AppPost[];
  initialData?: PaginatedPostsData;
  itemComponent?: React.ElementType;
}

export default function AppPostListAsync({
  hiddenTags,
  limit,
  title,
  posts,
  initialData,
  itemComponent,
}: AppPostListAsyncProps) {
  const ItemComponent = itemComponent ?? AppPostCard;
  const queryInitialData = buildPostGroupInitialData({ initialData, posts });

  const locale = useLocale();
  const t = useTranslations("common");
  const { data, isError, isPending, refetch } = useQuery({
    queryKey: ["fetchPostsByHiddenTags", hiddenTags, locale, limit],
    queryFn: () => fetchPostsByHiddenTags(hiddenTags, { limit, locale }),
    initialData: queryInitialData,
  });

  const resolvedPosts = data?.posts ?? [];
  const skeletonRows = Array.from(
    { length: Math.max(1, limit) },
    (_, index) => `row-${index}`,
  );

  return (
    <div className="@container">
      {title && (
        <AppSectionHeader className="text-sm uppercase @md:text-base">
          {title}
        </AppSectionHeader>
      )}
      {isPending ? (
        <div role="status" aria-busy="true" className="space-y-2 p-2">
          <span className="sr-only">{t("loading")}</span>
          {skeletonRows.map((row) => (
            <div
              key={row}
              className="h-14 rounded-xl bg-surface-muted motion-safe:animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <PostQueryFeedback onRetry={() => void refetch()} />
      ) : resolvedPosts.length === 0 ? (
        <PostQueryFeedback />
      ) : (
        <ul className="relative flex flex-col gap-2 rounded-lg p-2">
          {resolvedPosts.map((post) => (
            <li className="block w-full min-w-0" key={post.slug}>
              <ItemComponent post={post} className="h-14 text-sm" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
