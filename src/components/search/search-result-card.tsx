"use client";

import { BookOpenText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { AppPost } from "@/definitions";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";
import {
  formatSearchPostDate,
  getPostPrimaryCategoryLabel,
  type PopulatedTagLike,
  splitHighlightSegments,
} from "@/utils/search";

interface SearchResultCardProps {
  id: string;
  post: AppPost;
  query: string;
  locale: string;
  isSelected: boolean;
  fallbackLabel: string;
  onSelect: () => void;
  onMouseEnter: () => void;
}

export function SearchResultCard({
  id,
  post,
  query,
  locale,
  isSelected,
  fallbackLabel,
  onSelect,
  onMouseEnter,
}: SearchResultCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [isSelected]);

  const categoryLabel = getPostPrimaryCategoryLabel(
    post.hiddenTags as Array<string | PopulatedTagLike> | undefined,
  );
  const formattedDate = formatSearchPostDate(post.publishedAt, locale);
  const titleSegments = splitHighlightSegments(post.title, query);
  let titleOffset = 0;
  const keyedTitleSegments = titleSegments.map((segment) => {
    const start = titleOffset;
    titleOffset += segment.text.length;
    return { ...segment, start };
  });
  const thumbnailUrl =
    typeof post.thumbnail === "object" &&
    post.thumbnail !== null &&
    typeof post.thumbnail.url === "string"
      ? post.thumbnail.url
      : null;

  return (
    <Link
      ref={cardRef}
      id={id}
      tabIndex={-1}
      href={`/posts/${post.slug}`}
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      className={cn(
        "group flex gap-3.5 border-b border-border-warm py-4 transition-colors duration-150 last:border-b-0 active:bg-stone-50 motion-reduce:transition-none sm:gap-4",
        "focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-warm focus-visible:outline-none",
        isSelected &&
          "-mx-3 rounded-xl border-b-transparent bg-white px-3 shadow-[0_2px_10px_rgba(0,0,0,0.04)] ring-1 ring-ring/30",
      )}
    >
      <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-xl bg-surface-muted sm:w-32">
        {thumbnailUrl ? (
          <Image
            unoptimized
            src={transformUrl(thumbnailUrl, { width: "320" })}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 112px, 128px"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-primary-800 via-primary-700 to-keppel-600 p-2 text-white/90"
          >
            <BookOpenText className="size-4 opacity-85" />
            <span className="line-clamp-1 text-center font-lora text-[10px] font-semibold tracking-wide">
              {categoryLabel ?? fallbackLabel}
            </span>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {(categoryLabel || formattedDate) && (
          <div className="mb-0.5 flex flex-wrap items-center gap-1.5 text-[11.5px] font-bold text-secondary-600">
            {categoryLabel && <span>{categoryLabel}</span>}
            {categoryLabel && formattedDate && (
              <span aria-hidden="true" className="text-stone-400">
                •
              </span>
            )}
            {formattedDate && (
              <span className="font-semibold text-stone-500">
                {formattedDate}
              </span>
            )}
          </div>
        )}

        <h3
          className={cn(
            "line-clamp-2 font-lora text-[16px] leading-[1.35] font-semibold text-stone-900 transition-colors duration-150 motion-reduce:transition-none sm:text-[16.5px]",
            "group-hover:text-primary-700",
            isSelected && "text-primary-700",
          )}
        >
          {keyedTitleSegments.map((segment) =>
            segment.highlighted ? (
              <mark
                key={segment.start}
                className="rounded-xs bg-primary-100/80 px-0.5 font-semibold text-primary-900"
              >
                {segment.text}
              </mark>
            ) : (
              <span key={segment.start}>{segment.text}</span>
            ),
          )}
        </h3>

        {post.shortBody && (
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.5] text-stone-600">
            {post.shortBody}
          </p>
        )}
      </div>
    </Link>
  );
}
