import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import type { AppPost } from "@/definitions";
import { getDataOrUndefined } from "@/payload/utils/data";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";
import { formatShortDate } from "@/utils/date";

interface PostListProps extends React.HTMLAttributes<HTMLUListElement> {
  posts: AppPost[];
  activeIndex?: number;
  effectOnHover?: boolean;
  showShortBody?: boolean;
}

export default function PostList({
  className,
  activeIndex,
  posts,
  effectOnHover,
  showShortBody,
}: PostListProps) {
  const locale = useLocale();

  return (
    <ul className={cn("post-list", className)}>
      {posts.map((post, index) => {
        const thumbnail = getDataOrUndefined(post.thumbnail);
        const date = formatShortDate(post.publishedAt, locale);
        const href = `/posts/${post.slug}`;

        return (
          <li
            key={post.slug}
            className={cn(
              "border-b border-border pt-2 pb-2 first:pt-0 last:border-0 hover:cursor-pointer",
              index === activeIndex && "rounded-lg bg-surface-muted",
              effectOnHover &&
                "transition-transform ease-in hover:scale-x-[103%] motion-reduce:transition-none motion-reduce:hover:scale-x-100 lg:hover:scale-x-105",
            )}
          >
            <Link
              prefetch={false}
              href={href}
              className="flex flex-row items-start gap-x-3 rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-md bg-surface-muted md:w-40 lg:w-28">
                {thumbnail?.url && (
                  <Image
                    unoptimized
                    className="object-cover"
                    src={transformUrl(thumbnail.url, { width: "150" })}
                    alt={post.title}
                    loading="lazy"
                    sizes="150px"
                    fill
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-foreground-muted">
                  {date}
                </div>
                <div
                  className={cn(
                    "line-clamp-1 text-base font-bold text-foreground",
                    !showShortBody &&
                      post.shortBody &&
                      "line-clamp-2 leading-tight",
                  )}
                >
                  {post.title}
                </div>
                {showShortBody && post.shortBody && (
                  <div className="line-clamp-2 text-sm leading-tight text-foreground-muted lg:line-clamp-1">
                    {post.shortBody}
                  </div>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
