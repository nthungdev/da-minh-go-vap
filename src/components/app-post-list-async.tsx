"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { fetchPostsByHiddenTags } from "@/actions/post";
import AppPostCard from "@/components/app-post-card";
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
  const { data, error, isPending } = useQuery({
    queryKey: ["fetchPostsByHiddenTags", hiddenTags, locale, limit],
    queryFn: () => fetchPostsByHiddenTags(hiddenTags, { limit, locale }),
    initialData: queryInitialData,
  });

  // TODO make skeleton component
  if (isPending) return null;

  if (error) return <p>Error: {error.message}</p>;

  const resolvedPosts = data?.posts ?? [];

  return (
    <div className="@container">
      {title && (
        <AppSectionHeader className="text-sm uppercase @md:text-base">
          {title}
        </AppSectionHeader>
      )}
      <ul className="relative flex flex-col gap-2 rounded-xs p-2">
        {resolvedPosts.map((post) => (
          <li className="block w-full" key={post.slug}>
            <ItemComponent post={post} className="h-14 text-sm" />
          </li>
        ))}
      </ul>
    </div>
  );
}
