"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/utils/common";
import { transformUrl } from "@/utils/cloudflare";

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
 * KeywordTooltip renders an interactive hover card when the user hovers over
 * or focuses on a keyword, displaying an image, title, description, and optional link.
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
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<"top" | "bottom">("top");
  const triggerRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        // If trigger is too close to top of viewport, position card below
        if (rect.top < 220) {
          setPosition("bottom");
        } else {
          setPosition("top");
        }
      }
      setIsOpen(true);
    }, 120);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const triggerContent = children || keyword || title;

  return (
    <span
      ref={triggerRef}
      className={cn(
        "relative inline-block cursor-help border-b border-dashed border-primary-500 font-medium text-primary-700 transition-colors hover:border-primary-700 hover:text-primary-800",
        className,
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      tabIndex={0}
      role="button"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
    >
      {triggerContent}

      {isOpen && (
        <span
          ref={cardRef}
          role="tooltip"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={cn(
            "absolute left-1/2 z-50 w-72 -translate-x-1/2 rounded-xl border border-gray-200 bg-white p-3.5 shadow-xl transition-all duration-200 animate-in fade-in zoom-in-95",
            position === "top" ? "bottom-full mb-2" : "top-full mt-2",
          )}
        >
          {/* Arrow */}
          <span
            className={cn(
              "absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-gray-200 bg-white",
              position === "top"
                ? "-bottom-1.5 border-r border-b"
                : "-top-1.5 border-t border-l",
            )}
          />

          <span className="relative flex flex-col gap-2.5 text-left">
            {imageUrl && (
              <span className="relative block h-36 w-full overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={transformUrl(imageUrl, { width: "320", quality: "85" })}
                  alt={imageAlt || title}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </span>
            )}

            <span className="flex flex-col gap-1">
              <span className="font-semibold text-gray-900 leading-snug">
                {title}
              </span>
              <span className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                {description}
              </span>
            </span>

            {href && (
              <span className="mt-1 pt-1.5 border-t border-gray-100 flex justify-end">
                <Link
                  href={href}
                  className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Xem thêm →
                </Link>
              </span>
            )}
          </span>
        </span>
      )}
    </span>
  );
}
