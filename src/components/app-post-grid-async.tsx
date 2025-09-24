"use client";

import { fetchPostsByHiddenTags } from "@/actions/post";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import AppViewMoreLink from "./app-view-more-link";
import AppPostGridSkeleton from "./app-post-grid-skeleton";
import { AppPost } from "@/definitions";
import AppGridHeader from "@/components/app-grid-header";
import { useLocale } from "next-intl";

interface AppPostGridProps {
  hiddenTags: string[];
  limit: number;
  title: string;
  posts?: AppPost[];
  hasMore?: boolean;
  hidePostTitles?: boolean;
  className?: string;
}

export default function AppPostGrid({
  hiddenTags,
  limit,
  title,
  posts,
  hasMore,
  hidePostTitles,
  className,
}: AppPostGridProps) {
  console.log({ hidePostTitles });
  const locale = useLocale();
  const { data, error, isPending } = useQuery({
    queryKey: ["fetchPostsByHiddenTags", hiddenTags, locale],
    queryFn: async () => {
      const posts = await fetchPostsByHiddenTags(hiddenTags, {
        limit,
        locale,
      });
      return posts;
    },
    initialData: { posts: posts || [], hasMore: hasMore || false },
  });

  if (isPending) return <AppPostGridSkeleton count={limit} />;

  if (error) return <p>Error: {error.message}</p>;

  if (data) {
    const { posts, hasMore } = data;
    const jointHiddenTags = hiddenTags.join(",");
    const viewMoreHref = `/posts?ht=${encodeURIComponent(jointHiddenTags)}&ti=${encodeURIComponent(title)}`;

    return (
      <div className="my-2 space-y-2">
        <AppGridHeader text={title} />
        <ul
          className={`relative grid grid-flow-row gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}
        >
          {posts.map((post, index) => (
            // min-w-0 to override min-width: min-content that cause post title to not be truncated
            <li
              className="block w-full min-w-0 border border-transparent bg-white hover:ring-3"
              key={index}
            >
              <Link
                href={`/posts/${post.slug}`}
                className="block overflow-hidden border"
              >
                <div className="relative aspect-video">
                  {typeof post.thumbnail !== "string" &&
                    typeof post.thumbnail.url === "string" && (
                      <Image
                        className="object-cover"
                        src={post.thumbnail.url}
                        fill
                        sizes="100%"
                        alt={`${post.title}'s thumbnail`}
                      />
                    )}
                </div>
                {!hidePostTitles && (
                  <div className="space-y-2 p-2">
                    <span className="block truncate text-center text-xl">
                      {post.title}
                    </span>
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {hasMore && (
          <div className="flex flex-row justify-end">
            <AppViewMoreLink href={viewMoreHref} />
          </div>
        )}
      </div>
    );
  }
}
