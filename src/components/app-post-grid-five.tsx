"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { PostParams } from "@/definitions";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";

interface AppPostGridFiveProps {
  posts: PostParams[];
  className?: string;
}

export default function AppPostGridSix({
  posts,
  className,
}: AppPostGridFiveProps) {
  const t = useTranslations("common");
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
      className={cn(
        "relative grid grid-flow-row grid-cols-1 gap-stack md:aspect-video md:grid-cols-3",
        className,
      )}
    >
      {posts.slice(0, 6).map((post, index) => (
        // min-w-0 to override min-width: min-content that cause post title to not be truncated
        <li
          key={post.slug}
          className={cn(
            "relative block w-full min-w-0 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm focus-within:ring-2 focus-within:ring-ring hover:ring-2 hover:ring-primary md:aspect-video md:border-transparent",
            cellClasses[index],
          )}
        >
          <Link
            href={`/posts/${post.slug}`}
            className="relative block h-full w-full overflow-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <div className="relative aspect-video bg-surface-muted">
              {typeof post.thumbnail !== "string" &&
                typeof post.thumbnail?.url === "string" && (
                  <Image
                    unoptimized
                    className="object-cover"
                    src={transformUrl(post.thumbnail.url)}
                    fill
                    sizes="100%"
                    alt={t("thumbnailAlt", { title: post.title })}
                  />
                )}
            </div>
            <div className="space-y-2 p-card-sm text-foreground md:hidden">
              <h2 className="block truncate text-center text-xl font-semibold">
                {post.title}
              </h2>
              <span className="block w-full text-center text-sm font-medium text-primary">
                {t("viewMore")}...
              </span>
            </div>

            <div className="group absolute top-0 left-0 hidden size-full hover:cursor-pointer md:block">
              <div className="absolute bottom-0 left-0 w-full translate-y-full bg-linear-to-b from-transparent via-primary-900/85 to-primary-950/95 transition-transform group-hover:translate-y-0 motion-reduce:transition-none md:h-20 lg:h-24"></div>
              <div className="absolute bottom-0 left-0 w-full bg-primary-950/85 p-3">
                <span className="line-clamp-2 text-white md:text-sm lg:text-lg">
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
