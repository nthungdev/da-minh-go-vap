import { AppPost } from "@/definitions";
import { getDataOrUndefined } from "@/payload/utils/data";
import Image from "next/image";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

interface PostListProps extends React.HTMLAttributes<HTMLUListElement> {
  posts: AppPost[];
  activeIndex?: number;
  effectOnHover?: boolean;
}

export default function PostList({
  className,
  activeIndex,
  posts,
  effectOnHover,
}: PostListProps) {
  return (
    <ul className={twMerge(className)}>
      {posts.map((post, index) => {
        const thumbnail = getDataOrUndefined(post.thumbnail);
        const date = post.publishedAt.toLocaleDateString("vi-VN");
        const href = `/posts/${post.slug}`;

        return (
          <li
            key={index}
            className={twMerge(
              "border-b-2 border-gray-200 py-2 last:border-0 hover:cursor-pointer",
              index === activeIndex && "bg-gray-200",
              effectOnHover &&
                "transition-transform ease-in hover:scale-x-[103%] lg:hover:scale-x-105",
            )}
          >
            <Link href={href} className="flex flex-row gap-x-3">
              <div className="relative aspect-video w-28 md:w-40 lg:w-28">
                {thumbnail && thumbnail.url && (
                  <Image
                    className="object-cover"
                    src={thumbnail.url}
                    alt={post.title}
                    sizes="120px"
                    fill
                  />
                )}
              </div>
              <div className="flex-1">
                <div className="text-xxs font-semibold text-gray-500">
                  {date}
                </div>
                <div className="line-clamp-1 text-xs font-bold">
                  {post.title}
                </div>
                <div className="line-clamp-2 text-xs md:line-clamp-3 lg:line-clamp-2">
                  {post.shortBody}
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
