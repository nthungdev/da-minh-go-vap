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
              "border-b-2 border-gray-200 pt-2 pb-2 first:pt-0 last:border-0 hover:cursor-pointer",
              index === activeIndex && "bg-gray-200",
              effectOnHover &&
                "transition-transform ease-in hover:scale-x-[103%] lg:hover:scale-x-105",
            )}
          >
            <Link
              prefetch={false}
              href={href}
              className="flex flex-row items-start gap-x-3"
            >
              <div className="relative aspect-video w-32 md:w-40 lg:w-28">
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
              <div className="flex-1">
                <div className="text-xs font-semibold text-gray-500">
                  {date}
                </div>
                <div
                  className={cn(
                    "line-clamp-1 text-base font-bold",
                    !showShortBody &&
                      post.shortBody &&
                      "line-clamp-2 leading-tight",
                  )}
                >
                  {post.title}
                </div>
                {showShortBody && post.shortBody && (
                  <div className="line-clamp-2 leading-tight lg:line-clamp-1">
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
