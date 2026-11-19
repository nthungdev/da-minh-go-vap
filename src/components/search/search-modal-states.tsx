"use client";

import { AlertCircle, Clock, Search, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/utils/common";

export interface TopicOption {
  id: string;
  label: string;
  query: string;
}

const SKELETON_ROWS = [0, 1, 2];

export function SearchSkeletonList() {
  return (
    <div className="divide-y divide-[#e8e2d8]" aria-hidden="true">
      {SKELETON_ROWS.map((row) => (
        <div key={row} className="flex gap-3.5 py-4 sm:gap-4">
          <div className="aspect-video w-28 shrink-0 animate-pulse rounded-[10px] bg-stone-200/80 motion-reduce:animate-none sm:w-32" />
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
            <div className="h-3 w-28 animate-pulse rounded bg-stone-200/80 motion-reduce:animate-none" />
            <div className="h-4.5 w-4/5 animate-pulse rounded bg-stone-200/90 motion-reduce:animate-none" />
            <div className="h-3.5 w-full animate-pulse rounded bg-stone-200/70 motion-reduce:animate-none" />
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-stone-200/70 motion-reduce:animate-none" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface SearchIdleStateProps {
  recentSearches: string[];
  topics: TopicOption[];
  onPickQuery: (query: string) => void;
  onClearRecent: () => void;
}

export function SearchIdleState({
  recentSearches,
  topics,
  onPickQuery,
  onClearRecent,
}: SearchIdleStateProps) {
  const t = useTranslations("search");

  return (
    <div className="space-y-5 py-2">
      {recentSearches.length > 0 && (
        <section aria-labelledby="search-recent-heading">
          <div className="mb-2.5 flex items-center justify-between">
            <h4
              id="search-recent-heading"
              className="text-xs font-extrabold tracking-wider text-stone-500 uppercase"
            >
              {t("recentSearches")}
            </h4>
            <button
              type="button"
              onClick={onClearRecent}
              className={cn(
                "text-xs font-semibold text-stone-500 transition-colors hover:text-stone-800 motion-reduce:transition-none",
                "focus-visible:ring-primary-700 rounded px-1.5 py-0.5 focus-visible:ring-2 focus-visible:outline-none",
              )}
            >
              {t("clearRecent")}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onPickQuery(item)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border border-[#e8e2d8] bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition-colors motion-reduce:transition-none",
                  "hover:border-primary-700 hover:text-primary-800",
                  "focus-visible:ring-primary-700 focus-visible:ring-2 focus-visible:outline-none",
                )}
              >
                <Clock className="size-3.5 text-stone-400" aria-hidden="true" />
                <span>{item}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="search-topics-heading">
        <h4
          id="search-topics-heading"
          className="mb-2.5 text-xs font-extrabold tracking-wider text-stone-500 uppercase"
        >
          {t("suggestedTopics")}
        </h4>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <button
              key={topic.id}
              type="button"
              onClick={() => onPickQuery(topic.query)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-[#e8e2d8] bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition-colors motion-reduce:transition-none",
                "hover:border-primary-700 hover:bg-primary-50/40 hover:text-primary-800",
                "focus-visible:ring-primary-700 focus-visible:ring-2 focus-visible:outline-none",
              )}
            >
              <Sparkles
                className="text-secondary-600 size-3.5"
                aria-hidden="true"
              />
              <span>{topic.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

interface SearchEmptyStateProps {
  query: string;
  onClear: () => void;
}

export function SearchEmptyState({ query, onClear }: SearchEmptyStateProps) {
  const t = useTranslations("search");

  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
      <div className="bg-primary-50 text-primary-700 mb-3 flex size-11 items-center justify-center rounded-full border border-[#e8e2d8]">
        <Search className="size-5" aria-hidden="true" />
      </div>
      <p className="font-lora text-base font-semibold text-stone-900">
        {t("empty")}
      </p>
      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-stone-600">
        {query.trim() ? (
          <>
            <span className="font-semibold text-stone-800">
              &ldquo;{query.trim()}&rdquo;
            </span>{" "}
            — {t("emptyHint")}
          </>
        ) : (
          t("emptyHint")
        )}
      </p>
      <button
        type="button"
        onClick={onClear}
        className={cn(
          "mt-4 rounded-full border border-[#e8e2d8] bg-white px-4 py-1.5 text-xs font-bold text-stone-700 transition-colors motion-reduce:transition-none",
          "hover:border-primary-700 hover:text-primary-800",
          "focus-visible:ring-primary-700 focus-visible:ring-2 focus-visible:outline-none",
        )}
      >
        {t("clear")}
      </button>
    </div>
  );
}

interface SearchErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function SearchErrorState({ message, onRetry }: SearchErrorStateProps) {
  const t = useTranslations("search");

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center px-4 py-10 text-center"
    >
      <div className="mb-3 flex size-11 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600">
        <AlertCircle className="size-5" aria-hidden="true" />
      </div>
      <p className="font-lora text-base font-semibold text-stone-900">
        {t("errorTitle")}
      </p>
      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-stone-600">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className={cn(
          "bg-primary-700 hover:bg-primary-800 mt-4 rounded-full px-4 py-1.5 text-xs font-bold text-white transition-colors motion-reduce:transition-none",
          "focus-visible:ring-primary-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        )}
      >
        {t("retry")}
      </button>
    </div>
  );
}
