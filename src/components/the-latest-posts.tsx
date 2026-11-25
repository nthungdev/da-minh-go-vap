"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useId, useState } from "react";
import { fetchAllPosts } from "@/actions/post";
import AppCarousel from "@/components/app-carousel";
import { PostQueryFeedback } from "@/components/app-post-grid-async";
import PostList from "@/components/post-list";
import Spinner from "@/components/spinner";
import type { AppPost } from "@/definitions";
import { getDataOrUndefined } from "@/payload/utils/data";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";

const TRANSITION_DURATION = 8000;

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
  const t = useTranslations("posts");
  const id = useId();
  const carouselId = `the-latest-posts-carousel-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [currentIndex, setCurrentIndex] = useState(0);
  const {
    data = initialPosts || [],
    isError,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ["fetchLatestPosts", locale, postCount],
    queryFn: () => fetchAllPosts({ limit: postCount, locale }),
    placeholderData: keepPreviousData,
    initialData: initialPosts,
    staleTime: initialPosts ? 60_000 : undefined,
  });

  const heading = (
    <h2 className="inline-block rounded-lg bg-primary px-5 py-1.5 text-sm font-bold tracking-wide text-primary-foreground uppercase shadow-xs">
      {t("latest")}
    </h2>
  );

  return (
    <div className={cn("@container", className)}>
      <div className="mb-4">{heading}</div>
      {isPending && data.length === 0 ? (
        <div className="flex aspect-[3/1] items-center justify-center rounded-xl border border-border bg-surface-muted">
          <Spinner className="motion-reduce:animate-none" />
        </div>
      ) : data.length === 0 ? (
        <PostQueryFeedback
          onRetry={isError ? () => void refetch() : undefined}
        />
      ) : (
        <div
          className={cn(
            "flex flex-col gap-stack lg:flex-row lg:gap-4",
            postCount === 4 && "lg:h-[320px]",
            postCount === 5 && "lg:h-[402px]",
          )}
        >
          <AppCarousel
            id={carouselId}
            className="aspect-video h-full w-full overflow-hidden rounded-xl border border-border bg-surface-muted shadow-sm lg:w-auto"
            durations={data.map(() => TRANSITION_DURATION)}
            onTransition={setCurrentIndex}
          >
            {data.map((post, index) => {
              const thumbnail = getDataOrUndefined(post.thumbnail);

              return (
                <Link
                  key={post.slug}
                  href={`/posts/${post.slug}`}
                  aria-label={post.title}
                  className="relative block size-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:after:absolute focus-visible:after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset"
                >
                  {thumbnail?.url ? (
                    <Image
                      unoptimized
                      className="object-cover"
                      src={transformUrl(thumbnail.url, {
                        width: "640",
                        quality: "80",
                      })}
                      loading={index === 0 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : "low"}
                      priority={index === 0}
                      alt={post.title}
                      sizes="(max-width: 768px) 100vw, 66vw"
                      fill
                    />
                  ) : (
                    <div className="size-full bg-surface-muted" />
                  )}
                </Link>
              );
            })}
          </AppCarousel>

          <PostList
            className="flex-1"
            posts={data}
            activeIndex={currentIndex < data.length ? currentIndex : 0}
            showShortBody
          />
        </div>
      )}
    </div>
  );
}
