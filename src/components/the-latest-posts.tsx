"use client";

import Image from "next/image";
import Link from "next/link";
import AppPostCard from "./app-post-card";
import { fetchAllPosts } from "@/actions/post";
import { twMerge } from "tailwind-merge";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Spinner from "@/components/spinner";
import { useLocale } from "next-intl";

const POST_COUNT = 5;

interface TheLatestPostsProps {
  className?: string;
}

export default function TheLatestPosts(props: TheLatestPostsProps) {
  const { className } = props;
  const locale = useLocale();
  const {
    data: latestPosts,
    error,
    isPending,
  } = useQuery({
    queryKey: ["fetchLatestPosts", locale],
    queryFn: () => fetchAllPosts({ limit: POST_COUNT, locale }),
    placeholderData: keepPreviousData,
  });

  if (isPending)
    return (
      <div className="flex aspect-[3/1] items-center justify-center">
        <Spinner />
      </div>
    );

  if (error) return <p>Error: {error.message}</p>;

  if (!latestPosts.length) {
    return <div>No post found</div>;
  }

  const latestPost = latestPosts[0]!;
  const otherPosts = latestPosts.slice(1, 5);

  return (
    <div
      className={twMerge(
        "flex flex-col gap-2 lg:grid lg:grid-flow-row lg:grid-cols-3",
        className,
      )}
    >
      {/* The latest post */}
      <Link
        href={`/posts/${latestPost.slug}`}
        className="col-span-2 aspect-video"
      >
        <div className="relative h-full w-full overflow-hidden bg-blue-200 hover:cursor-pointer hover:ring-3">
          {typeof latestPost.thumbnail !== "string" &&
            typeof latestPost.thumbnail?.url === "string" && (
              <Image
                className="object-cover"
                src={latestPost.thumbnail.url}
                alt={latestPost.title}
                sizes="100%"
                priority
                fill
              />
            )}
          {/* Gradient overlay */}
          <div className="absolute top-0 left-0 h-full w-full bg-linear-to-b from-transparent from-60% to-black"></div>
          {/* Post text */}
          <div className="absolute bottom-0 left-0 flex flex-col gap-y-1 p-3 text-gray-100 lg:gap-y-2 lg:p-4">
            <span className="line-clamp-1 text-lg text-gray-100 lg:line-clamp-2 lg:text-2xl">
              {latestPost.title}
            </span>
            <span className="text-xs text-gray-200 lg:text-sm">
              {latestPost.publishedAt.toLocaleDateString("vi-VN")}
            </span>
          </div>
        </div>
      </Link>

      {/* Next 4 latest posts */}
      <div className="relative grid grid-flow-row grid-cols-2 gap-2 lg:h-full lg:max-w-full lg:grid-flow-col lg:grid-cols-1 lg:grid-rows-4">
        {otherPosts.map((post, index) => (
          <AppPostCard
            key={index}
            post={post}
            className={twMerge("bg-primary-1 border lg:border-transparent")}
            showDate
          />
        ))}
      </div>
    </div>
  );
}
