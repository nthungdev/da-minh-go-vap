"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { fetchPostsByHiddenTags } from "@/actions/post";
import AppPostCard from "@/components/app-post-card";
import AppSectionHeader from "@/components/app-section-header";
import type { AppPost } from "@/definitions";

interface AppPostListAsyncProps {
  hiddenTags: string[];
  limit: number;
  title?: string;
  posts?: AppPost[];
  itemComponent?: React.ElementType;
}

export default function AppPostListAsync({
  hiddenTags,
  limit,
  title,
  posts,
  itemComponent,
}: AppPostListAsyncProps) {
  const ItemComponent = itemComponent ?? AppPostCard;

  const locale = useLocale();
  const { data, error, isPending } = useQuery({
    queryKey: ["fetchPostsByHiddenTags", hiddenTags, locale, limit],
    queryFn: () => fetchPostsByHiddenTags(hiddenTags, { limit, locale }),
    initialData: { posts: posts || [], hasMore: false, page: 1, totalPages: 1 },
  });

  // TODO make skeleton component
  if (isPending) return null;

  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="@container">
      {title && (
        <AppSectionHeader className="text-sm uppercase @md:text-base">
          {title}
        </AppSectionHeader>
      )}
      <ul className="relative flex flex-col gap-2 rounded-xs p-2">
        {data.posts.map((post) => (
          <li className="block w-full" key={post.slug}>
            <ItemComponent post={post} className="h-14 text-sm" />
          </li>
        ))}
      </ul>
    </div>
  );
}
