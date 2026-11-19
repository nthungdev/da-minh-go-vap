"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpenText } from "lucide-react";
import { AppPost } from "@/definitions";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";
import {
  formatSearchPostDate,
  getPostPrimaryCategoryLabel,
  PopulatedTagLike,
  splitHighlightSegments,
} from "@/utils/search";

interface SearchResultCardProps {
  post: AppPost;
  query: string;
  locale: string;
  isSelected: boolean;
  fallbackLabel: string;
  onSelect: () => void;
  onMouseEnter: () => void;
}

export function SearchResultCard({
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
  const thumbnailUrl =
    typeof post.thumbnail === "object" &&
    post.thumbnail !== null &&
    typeof post.thumbnail.url === "string"
      ? post.thumbnail.url
      : null;

  return (
    <Link
      ref={cardRef}
      href={`/posts/${post.slug}`}
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      className={cn(
        "group flex gap-3.5 border-b border-[#e8e2d8] py-4 transition-colors duration-150 last:border-b-0 motion-reduce:transition-none sm:gap-4",
        "focus-visible:ring-primary-700 focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf8f5] focus-visible:outline-none",
        isSelected &&
          "-mx-3 rounded-xl border-b-transparent bg-white px-3 shadow-[0_2px_10px_rgba(0,0,0,0.04)]",
      )}
    >
      <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-[10px] bg-stone-200 sm:w-32">
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
            className="from-primary-800 via-primary-700 to-keppel-600 flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br p-2 text-white/90"
          >
            <BookOpenText className="size-4 opacity-85" />
            <span className="font-lora line-clamp-1 text-center text-[10px] font-semibold tracking-wide">
              {categoryLabel ?? fallbackLabel}
            </span>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {(categoryLabel || formattedDate) && (
          <div className="text-secondary-600 mb-0.5 flex flex-wrap items-center gap-1.5 text-[11.5px] font-bold">
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
            "font-lora line-clamp-2 text-[16px] leading-[1.35] font-semibold text-stone-900 transition-colors duration-150 motion-reduce:transition-none sm:text-[16.5px]",
            "group-hover:text-primary-700",
            isSelected && "text-primary-700",
          )}
        >
          {titleSegments.map((segment, index) =>
            segment.highlighted ? (
              <mark
                key={index}
                className="bg-primary-100/80 text-primary-900 rounded-xs px-0.5 font-semibold"
              >
                {segment.text}
              </mark>
            ) : (
              <span key={index}>{segment.text}</span>
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
