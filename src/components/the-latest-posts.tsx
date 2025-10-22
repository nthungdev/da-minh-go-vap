"use client";

import Image from "next/image";
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
import { createRandomAlphaString } from "@/utils/common";
import Link from "next/link";

const TRANSITION_DURATION = 4000;

const labels: Record<Locale, string> = {
  vi: "Tin Mới",
  en: "Latest Posts",
};

interface TheLatestPostsProps {
  postCount?: 4 | 5;
  className?: string;
}

export default function TheLatestPosts({
  postCount,
  className,
}: TheLatestPostsProps) {
  const locale = useLocale();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data, error, isPending } = useQuery({
    queryKey: ["fetchLatestPosts", locale, postCount],
    queryFn: () => fetchAllPosts({ limit: postCount, locale }),
    placeholderData: keepPreviousData,
  });

  if (isPending)
    return (
      <div className="flex aspect-[3/1] items-center justify-center">
        <Spinner />
      </div>
    );

  if (error) return <p>Error: {error.message}</p>;

  if (!data.length) {
    return <div>No post found</div>;
  }

  const carouselId = `the-latest-posts-carousel-${createRandomAlphaString(4)}`;
  const postHref = `${process.env.NEXT_PUBLIC_BASE_URL}/posts/${data[currentIndex]?.slug}`;

  return (
    <div className={twMerge("@container", className)}>
      <div className="mb-4">
        <span className="bg-primary cursor-default rounded-md px-6 py-1 font-bold text-white uppercase">
          {labels[locale]}
        </span>
      </div>
      <div
        className={twMerge(
          "flex flex-col gap-x-2 lg:flex-row",
          postCount === 4 && "lg:h-[320px]",
          postCount === 5 && "lg:h-[402px]",
        )}
      >
        <Link href={postHref}>
          <AppCarousel
            id={carouselId}
            className="bg-primary-2 aspect-video h-full w-auto"
            durations={data.map(() => TRANSITION_DURATION)}
            onTransition={setCurrentIndex}
          >
            {data.map((post, index) => {
              const thumbnail = getDataOrUndefined(post.thumbnail);

              return (
                <div
                  key={index}
                  className="hs-carousel-slide relative size-full"
                >
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
        </Link>

        <PostList
          className="flex-1"
          posts={data}
          activeIndex={currentIndex}
          showShortBody
        />
      </div>
    </div>
  );
}
