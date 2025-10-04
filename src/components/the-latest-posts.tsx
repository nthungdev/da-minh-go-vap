"use client";

import Image from "next/image";
import Link from "next/link";
import { fetchAllPosts } from "@/actions/post";
import { twMerge } from "tailwind-merge";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Spinner from "@/components/spinner";
import { useLocale } from "next-intl";
import { Locale } from "@/i18n/config";
import { getDataOrUndefined } from "@/payload/utils/data";
import AppCarousel from "@/components/app-carousel";
import { useState } from "react";
import PostList from "@/components/post-list";

const POST_COUNT = 5;
const TRANSITION_DURATION = 4000;

const labels: Record<Locale, string> = {
  vi: "Tin Mới",
  en: "Latest Posts",
};

interface TheLatestPostsProps {
  className?: string;
}

export default function TheLatestPosts(props: TheLatestPostsProps) {
  const { className } = props;
  const locale = useLocale();
  const [currentIndex, setCurrentIndex] = useState(0);
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

  return (
    <div className={twMerge(className)}>
      <div className="mb-4">
        <span className="bg-primary cursor-default rounded-md px-6 py-1 text-sm font-bold text-white uppercase">
          {labels[locale]}
        </span>
      </div>
      <div className="flex flex-col gap-x-4 p-2 lg:flex-row">
        <AppCarousel
          id="the-latest-posts-carousel"
          className="bg-primary-2 aspect-video lg:aspect-auto lg:w-3/5"
          durations={latestPosts.map(() => TRANSITION_DURATION)}
          onTransition={setCurrentIndex}
        >
          {latestPosts.map((post, index) => {
            const thumbnail = getDataOrUndefined(post.thumbnail);

            return (
              <div key={index} className="hs-carousel-slide relative size-full">
                {thumbnail && thumbnail.url ? (
                  <Image
                    className="object-cover"
                    src={thumbnail.url}
                    alt={post.title}
                    sizes="90vw"
                    fill
                  />
                ) : (
                  <div className="size-full bg-gray-300"></div>
                )}
              </div>
            );
          })}
        </AppCarousel>

        <PostList
          className="lg:flex-1"
          posts={latestPosts}
          activeIndex={currentIndex}
        />
      </div>
    </div>
  );
}
