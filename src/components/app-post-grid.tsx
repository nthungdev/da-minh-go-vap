import { PostParams } from "@/definitions";
import Image from "next/image";
import Link from "next/link";
import { HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface AppPostGridProps extends HTMLAttributes<HTMLElement> {
  posts: PostParams[];
}

export default function AppPostGrid({ posts, className }: AppPostGridProps) {
  return (
    <ul
      className={twMerge(
        "relative grid grid-flow-row md:grid-cols-2 lg:grid-cols-4 gap-4",
        className,
      )}
    >
      {posts.map((post, index) => (
        // min-w-0 to override min-width: min-content that cause post title to not be truncated
        <li
          className="block w-full min-w-0 bg-white hover:ring border border-transparent"
          key={index}
        >
          <Link
            href={`/posts/${post.slug}`}
            className="block overflow-hidden border"
          >
            <div className="relative aspect-video">
              {typeof post.thumbnail !== "string" &&
                typeof post.thumbnail?.url === "string" && (
                  <Image
                    className="object-cover"
                    src={post.thumbnail.url}
                    fill
                    sizes="100%"
                    alt={`${post.title}'s thumbnail`}
                  />
                )}
            </div>
            <div className="p-2 space-y-2">
              <h2 className="text-center block text-xl truncate">
                {post.title}
              </h2>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
