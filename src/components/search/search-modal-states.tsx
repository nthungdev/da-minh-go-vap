"use client";

import { AlertCircle, Clock, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/utils/common";

const SKELETON_ROWS = [0, 1, 2];

export function SearchSkeletonList() {
  return (
    <div className="divide-y divide-border-warm" aria-hidden="true">
      {SKELETON_ROWS.map((row) => (
        <div key={row} className="flex gap-3.5 py-4 sm:gap-4">
          <div className="aspect-video w-28 shrink-0 animate-pulse rounded-xl bg-stone-200/80 motion-reduce:animate-none sm:w-32" />
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
            <div className="h-3 w-28 animate-pulse rounded-sm bg-stone-200/80 motion-reduce:animate-none" />
            <div className="h-4.5 w-4/5 animate-pulse rounded-sm bg-stone-200/90 motion-reduce:animate-none" />
            <div className="h-3.5 w-full animate-pulse rounded-sm bg-stone-200/70 motion-reduce:animate-none" />
            <div className="h-3.5 w-2/3 animate-pulse rounded-sm bg-stone-200/70 motion-reduce:animate-none" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface SearchIdleStateProps {
  recentSearches: string[];
  onPickQuery: (query: string) => void;
  onClearRecent: () => void;
}

export function SearchIdleState({
  recentSearches,
  onPickQuery,
  onClearRecent,
}: SearchIdleStateProps) {
  const t = useTranslations("search");

  if (recentSearches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
        <p className="max-w-sm text-xs leading-relaxed text-stone-500">
          {t("idlePrompt")}
        </p>
      </div>
    );
  }

  return (
    <div className="py-2">
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
              "text-xs font-semibold text-stone-500 transition-colors duration-150 hover:cursor-pointer hover:text-stone-800 active:text-stone-950 motion-reduce:transition-none",
              "rounded px-1.5 py-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none",
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
                "inline-flex items-center gap-1.5 rounded-full border border-border-warm bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition-colors duration-150 hover:cursor-pointer motion-reduce:transition-none",
                "hover:border-primary-700 hover:text-primary-800 active:bg-stone-100",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none",
              )}
            >
              <Clock className="size-3.5 text-stone-400" aria-hidden="true" />
              <span>{item}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

interface SearchEmptyStateProps {
  query: string;
  tagLabel?: string | null;
  onClear: () => void;
}

export function SearchEmptyState({
  query,
  tagLabel,
  onClear,
}: SearchEmptyStateProps) {
  const t = useTranslations("search");
  const trimmedQuery = query.trim();
  const contextLabel = [
    trimmedQuery ? `"${trimmedQuery}"` : null,
    tagLabel ? `#${tagLabel}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
      <div className="mb-3 flex size-11 items-center justify-center rounded-full border border-border-warm bg-primary-50 text-primary-700">
        <Search className="size-5" aria-hidden="true" />
      </div>
      <p className="font-lora text-base font-semibold text-stone-900">
        {t("empty")}
      </p>
      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-stone-600">
        {contextLabel ? (
          <>
            <span className="font-semibold text-stone-800">{contextLabel}</span>{" "}
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
          "mt-4 rounded-full border border-border-warm bg-white px-4 py-1.5 text-xs font-bold text-stone-700 transition-colors duration-150 hover:cursor-pointer motion-reduce:transition-none",
          "hover:border-primary-700 hover:text-primary-800 active:bg-stone-100",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
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
          "mt-4 rounded-full bg-primary-700 px-4 py-1.5 text-xs font-bold text-white transition-colors duration-150 hover:cursor-pointer hover:bg-primary-800 active:bg-primary-900 motion-reduce:transition-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
        )}
      >
        {t("retry")}
      </button>
    </div>
  );
}
