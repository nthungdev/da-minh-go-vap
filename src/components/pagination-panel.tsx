"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { HTMLAttributes } from "react";
import { cn } from "@/utils/common";

interface PaginationPanelProps extends HTMLAttributes<HTMLElement> {
  totalPages: number;
  page: number;
  onPageChange?: (page: number) => void;
}

const buttonClassName =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border px-3 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none sm:min-h-9 sm:min-w-9";
const inactiveClassName =
  "border-border bg-surface text-primary hover:border-primary hover:bg-accent";
const arrowClassName = cn(
  buttonClassName,
  inactiveClassName,
  "disabled:cursor-not-allowed disabled:border-border-subtle disabled:bg-surface-muted disabled:text-foreground-muted/50",
);

export default function PaginationPanel({
  totalPages,
  page,
  className,
  onPageChange,
}: PaginationPanelProps) {
  const t = useTranslations("common");
  const allPages = Array(totalPages)
    .fill(null)
    .map((_, index) => index + 1);
  const shownPages = allPages.slice(Math.max(page - 3, 0), page + 2);

  return (
    <nav
      aria-label={t("pagination")}
      className={cn(
        "flex flex-row flex-wrap items-center justify-center gap-1.5",
        className,
      )}
    >
      <button
        type="button"
        aria-label={t("firstPage")}
        className={arrowClassName}
        disabled={page <= 1}
        onClick={() => onPageChange?.(1)}
      >
        <ChevronsLeft className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={t("previousPage")}
        className={arrowClassName}
        disabled={page <= 1}
        onClick={() => onPageChange?.(page - 1)}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>
      {shownPages.map((p) => (
        <button
          key={p}
          type="button"
          aria-current={p === page ? "page" : undefined}
          aria-label={t("pageNumber", { page: p })}
          className={cn(
            buttonClassName,
            p === page
              ? "border-primary bg-primary font-semibold text-primary-foreground"
              : inactiveClassName,
          )}
          onClick={() => {
            if (p !== page) onPageChange?.(p);
          }}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        aria-label={t("nextPage")}
        className={arrowClassName}
        disabled={page >= totalPages}
        onClick={() => onPageChange?.(page + 1)}
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={t("lastPage")}
        className={arrowClassName}
        disabled={page >= totalPages}
        onClick={() => onPageChange?.(totalPages)}
      >
        <ChevronsRight className="size-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
