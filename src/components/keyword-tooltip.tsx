"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";

export interface KeywordTooltipProps {
  /** The keyword or phrase displayed in text (if children not provided) */
  keyword?: string;
  /** Title shown inside the tooltip card */
  title: string;
  /** Description or definition of the keyword */
  description: string;
  /** Optional image URL */
  imageUrl?: string;
  /** Optional image alt text */
  imageAlt?: string;
  /** Optional link to read more about the keyword */
  href?: string;
  /** Custom trigger styling */
  className?: string;
  /** Custom trigger content */
  children?: ReactNode;
}

/**
 * Shows an interactive keyword definition on hover, keyboard focus, or activation.
 */
export default function KeywordTooltip({
  keyword,
  title,
  description,
  imageUrl,
  imageAlt,
  href,
  className,
  children,
}: KeywordTooltipProps) {
  const t = useTranslations("common");
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ below: false, left: 0, arrow: 0 });
  const dialogId = useId();
  const containerRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
  }, []);

  const updatePosition = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const root = document.documentElement;
    const rem = Number.parseFloat(getComputedStyle(root).fontSize);
    const viewportWidth = root.clientWidth;
    const cardWidth = Math.min(18 * rem, viewportWidth - 2 * rem);
    const center = rect.left + rect.width / 2;
    const left = Math.max(
      rem,
      Math.min(center - cardWidth / 2, viewportWidth - cardWidth - rem),
    );
    setPosition({
      below: rect.top < 220,
      left: left - rect.left,
      arrow: Math.max(rem, Math.min(center - left, cardWidth - rem)),
    });
  }, []);

  const scheduleOpen = () => {
    clearTimer();
    timeoutRef.current = setTimeout(() => {
      updatePosition();
      setIsOpen(true);
    }, 120);
  };

  const handlePointerEnter = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse") scheduleOpen();
  };

  const handlePointerLeave = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") return;
    clearTimer();
    if (containerRef.current?.contains(document.activeElement)) return;
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (containerRef.current?.contains(event.relatedTarget)) return;
    clearTimer();
    setIsOpen(false);
  };

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  useEffect(() => {
    if (!isOpen) return;

    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      event.preventDefault();
      triggerRef.current?.focus({ preventScroll: true });
      clearTimer();
      setIsOpen(false);
    };

    const dismissOnOutsidePointer = (event: globalThis.PointerEvent) => {
      if (
        event.target instanceof Node &&
        containerRef.current?.contains(event.target)
      ) {
        return;
      }
      clearTimer();
      setIsOpen(false);
    };

    window.addEventListener("keydown", dismissOnEscape);
    window.addEventListener("pointerdown", dismissOnOutsidePointer);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("keydown", dismissOnEscape);
      window.removeEventListener("pointerdown", dismissOnOutsidePointer);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, clearTimer, updatePosition]);

  const triggerContent = children || keyword || title;

  return (
    <span ref={containerRef} className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        className={cn(
          "inline cursor-help rounded-sm border-b border-dashed border-primary-500 bg-transparent p-0 font-medium text-primary-700 transition-colors duration-150 hover:border-primary-700 hover:text-primary-800 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:text-primary-900 motion-reduce:transition-none",
          className,
        )}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onBlur={handleBlur}
        onFocus={(event) => {
          if (!event.currentTarget.matches(":focus-visible")) return;
          clearTimer();
          updatePosition();
          setIsOpen(true);
        }}
        onClick={() => {
          clearTimer();
          if (!isOpen) updatePosition();
          setIsOpen((previous) => !previous);
        }}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? dialogId : undefined}
      >
        {triggerContent}
      </button>

      {isOpen && (
        <span
          id={dialogId}
          role="dialog"
          aria-label={title}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onBlur={handleBlur}
          style={{ left: position.left }}
          className={cn(
            "absolute z-50 w-72 max-w-[calc(100vw-2rem)] animate-in rounded-xl border border-gray-200 bg-white p-3.5 shadow-xl transition-all duration-200 zoom-in-95 fade-in motion-reduce:animate-none motion-reduce:transition-none",
            position.below ? "top-full mt-2" : "bottom-full mb-2",
          )}
        >
          {/* Arrow */}
          <span
            style={{ left: position.arrow }}
            className={cn(
              "absolute h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-gray-200 bg-white",
              position.below
                ? "-top-1.5 border-t border-l"
                : "-bottom-1.5 border-r border-b",
            )}
          />

          <span className="relative flex flex-col gap-2.5 text-left">
            {imageUrl && (
              <span className="relative block h-36 w-full overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={transformUrl(imageUrl, { width: "320", quality: "85" })}
                  alt={imageAlt || title}
                  fill
                  className="object-cover transition-transform duration-200 hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </span>
            )}

            <span className="flex flex-col gap-1">
              <span className="leading-snug font-semibold text-gray-900">
                {title}
              </span>
              <span className="line-clamp-3 text-xs leading-relaxed text-gray-600">
                {description}
              </span>
            </span>

            {href && (
              <span className="mt-1 flex justify-end border-t border-gray-100 pt-1.5">
                <Link
                  href={href}
                  className="rounded-sm text-xs font-medium text-primary-700 transition-colors duration-150 hover:text-primary-900 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:text-primary-950 motion-reduce:transition-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t("readMore")} →
                </Link>
              </span>
            )}
          </span>
        </span>
      )}
    </span>
  );
}
