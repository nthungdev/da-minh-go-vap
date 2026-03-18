import { AppPost } from "@/definitions";
import { getDataOrUndefined } from "@/payload/utils/data";
import { transformUrl } from "@/utils/cloudflare";
import Image from "next/image";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

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
  return (
    <ul className={twMerge("post-list space-y-2", className)}>
      {posts.map((post, index) => {
        const thumbnail = getDataOrUndefined(post.thumbnail);
        const date = post.publishedAt.toLocaleDateString("vi-VN");
        const href = `/posts/${post.slug}`;

        return (
          <li
            key={index}
            className={twMerge(
              "border-b-2 border-gray-200 last:border-0 hover:cursor-pointer",
              index === activeIndex && "bg-gray-200",
              effectOnHover &&
                "transition-transform ease-in hover:scale-x-[103%] lg:hover:scale-x-105",
            )}
          >
            <Link href={href} className="flex flex-row items-start gap-x-3">
              <div className="relative aspect-video w-32 md:w-40 lg:w-28">
                {thumbnail && thumbnail.url && (
                  <Image
                    unoptimized
                    className="object-cover"
                    src={transformUrl(thumbnail.url)}
                    alt={post.title}
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
                  className={twMerge(
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
