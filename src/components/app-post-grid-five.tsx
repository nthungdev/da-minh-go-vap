"use client";

import Image from "next/image";
import Link from "next/link";
import type { PostParams } from "@/definitions";
import { twMerge } from "tailwind-merge";

interface AppPostGridFiveProps {
  posts: PostParams[];
  className?: string;
}

export default function AppPostGridSix({
  posts,
  className,
}: AppPostGridFiveProps) {
  const cellClasses: Record<number, string> = {
    0: "",
    1: "row-start-2 col-start-1",
    2: "md:col-start-2 row-start-1 md:row-span-2 md:col-span-2",
    3: "",
    4: "",
    5: "",
  };

  return (
    <ul
      className={`relative grid grid-flow-row grid-cols-1 gap-4 md:aspect-video md:grid-cols-3 ${className}`}
    >
      {posts.slice(0, 6).map((post, index) => (
        // min-w-0 to override min-width: min-content that cause post title to not be truncated
        <li
          key={index}
          className={twMerge(
            "relative block w-full min-w-0 overflow-hidden border bg-white hover:ring-3 md:aspect-video md:border-transparent",
            cellClasses[index],
          )}
        >
          <Link
            href={`/posts/${post.slug}`}
            className="relative block h-full w-full overflow-hidden hover:ring-2"
          >
            <div className="relative aspect-video bg-gray-50">
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
            <div className="space-y-2 p-2">
              <h2 className="block truncate text-center text-xl">
                {post.title}
              </h2>
              <button className="block w-full text-center">Xem tiếp...</button>
            </div>

            <div className="group absolute top-0 left-0 hidden size-full hover:cursor-pointer md:block">
              {/* static black gradient background */}
              <div className="bg-opacity-50 to-primary-800 absolute bottom-0 left-0 w-full bg-linear-to-b from-transparent from-5% md:h-20 lg:h-24"></div>
              {/* slide up secondary color gradient background */}
              <div className="bg-opacity-50 via-secondary-400 to-secondary-400 absolute bottom-0 left-0 w-full translate-y-full bg-linear-to-b from-transparent from-5% via-40% transition group-hover:translate-y-0 md:h-20 lg:h-24"></div>
              {/* static post title */}
              <div className="absolute bottom-0 left-0 w-full p-3">
                <span className="font-header line-clamp-2 text-white md:text-sm lg:text-lg">
                  {post.title}
                </span>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
