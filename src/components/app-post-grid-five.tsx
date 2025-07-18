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
      className={`md:aspect-video relative grid grid-flow-row grid-cols-1 md:grid-cols-3 gap-4 ${className}`}
    >
      {posts.slice(0, 6).map((post, index) => (
        // min-w-0 to override min-width: min-content that cause post title to not be truncated
        <li
          key={index}
          className={twMerge(
            "relative md:aspect-video overflow-hidden block w-full min-w-0 bg-white border md:border-transparent hover:ring",
            cellClasses[index],
          )}
        >
          <Link
            href={`/posts/${post.slug}`}
            className="relative w-full h-full block overflow-hidden hover:ring-2"
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
            <div className="p-2 space-y-2">
              <h2 className="text-center block text-xl truncate">
                {post.title}
              </h2>
              <button className="w-full text-center block">Xem tiếp...</button>
            </div>

            <div className="group hidden md:block absolute top-0 left-0 size-full hover:cursor-pointer">
              {/* static black gradient background */}
              <div className="absolute w-full md:h-20 lg:h-24 left-0 bottom-0 bg-opacity-50 bg-gradient-to-b from-transparent from-5% to-primary-800"></div>
              {/* slide up secondary color gradient background */}
              <div className="absolute w-full md:h-20 lg:h-24 left-0 bottom-0 translate-y-full group-hover:translate-y-0 transition bg-opacity-50 bg-gradient-to-b from-transparent from-5% via-secondary-400 via-40% to-secondary-400"></div>
              {/* static post title */}
              <div className="absolute bottom-0 left-0 p-3 w-full">
                <span className="md:text-sm lg:text-lg line-clamp-2 text-white font-header">
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
