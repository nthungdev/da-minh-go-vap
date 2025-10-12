import { AppPost } from "@/definitions";
import Image from "next/image";
import Link from "next/link";
import { HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface AppPostGridProps extends HTMLAttributes<HTMLElement> {
  posts: AppPost[];
}

export default function AppPostGrid({ posts, className }: AppPostGridProps) {
  return (
    <ul
      className={twMerge(
        `relative grid grid-flow-row gap-4 md:grid-cols-2 lg:grid-cols-4`,
        className,
      )}
    >
      {posts.map((post, index) => (
        // min-w-0 to override min-width: min-content that cause post title to not be truncated
        <li
          className="block w-full min-w-0 border border-transparent bg-white hover:ring-3"
          key={index}
        >
          <Link
            href={`/posts/${post.slug}`}
            className="block overflow-hidden border border-gray-300"
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
            <div className="line-clamp-3 w-full space-y-2 p-1.5 text-center text-base lg:text-lg">
              {post.title}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
