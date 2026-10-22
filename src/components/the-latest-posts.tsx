"use client";

import { fetchAllPosts } from "@/actions/post";
import AppCarousel from "@/components/app-carousel";
import PostList from "@/components/post-list";
import Spinner from "@/components/spinner";
import { AppPost } from "@/definitions";
import { Locale } from "@/i18n/config";
import { getDataOrUndefined } from "@/payload/utils/data";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";

const TRANSITION_DURATION = 4000;

const labels: Record<Locale, string> = {
  vi: "Tin Mới",
  en: "Latest Posts",
};

interface TheLatestPostsProps {
  postCount?: 4 | 5;
  className?: string;
  initialPosts?: AppPost[];
}

export default function TheLatestPosts({
  postCount = 4,
  className,
  initialPosts,
}: TheLatestPostsProps) {
  const locale = useLocale();
  const [currentIndex, setCurrentIndex] = useState(0);
  const reactId = useId();
  const carouselId = `the-latest-posts-carousel-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const { data, error, isPending } = useQuery({
    queryKey: ["fetchLatestPosts", locale, postCount],
    queryFn: () => fetchAllPosts({ limit: postCount, locale }),
    placeholderData: keepPreviousData,
    initialData: initialPosts,
    staleTime: initialPosts ? 60_000 : undefined,
  });

  if (isPending)
    return (
      <div className="flex aspect-[3/1] items-center justify-center">
        <Spinner />
      </div>
    );

  // If initial or cached data is available, keep showing it even if a background refetch fails
  if (error && !data?.length) return <p>Error: {error.message}</p>;

  if (!data?.length) {
    return <div>No post found</div>;
  }

  const postHref = `/posts/${data[currentIndex]?.slug}`;

  return (
    <div className={cn("@container", className)}>
      <div className="mb-4">
        <span className="bg-primary cursor-default rounded-md px-6 py-1 font-bold text-white uppercase">
          {labels[locale]}
        </span>
      </div>
      <div
        className={cn(
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
                      loader={({ src, width }) => {
                        const transformWidth = width > 600 ? 1000 : 600;
                        return transformUrl(src, {
                          width: String(transformWidth),
                        });
                      }}
                      priority={index === 0}
                      alt={post.title}
                      sizes="(max-width: 768px) 100vw, 66vw"
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
