"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, List } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/utils/common";
import {
  extractTableOfContents,
  type TocItem,
} from "@/utils/table-of-contents";

interface PostTableOfContentsProps {
  enabled: boolean;
  className?: string;
  children: React.ReactNode;
}

function areTocItemsEqual(a: TocItem[], b: TocItem[]): boolean {
  if (a.length !== b.length) return false;
  return a.every(
    (item, index) =>
      item.id === b[index]?.id &&
      item.text === b[index]?.text &&
      item.level === b[index]?.level,
  );
}

/**
 * Wraps the rendered article body, extracts `h2`/`h3` headings from the DOM when enabled,
 * and displays an inline collapsible Table of Contents above the article content.
 */
export default function PostTableOfContents({
  enabled,
  className,
  children,
}: PostTableOfContentsProps) {
  const t = useTranslations("posts");
  const contentRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const [items, setItems] = useState<TocItem[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const hasScrolledInitialHashRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      return;
    }

    const container = contentRef.current;
    if (!container) return;

    const syncHeadings = () => {
      const extracted = extractTableOfContents(container);
      setItems((prev) =>
        areTocItemsEqual(prev, extracted) ? prev : extracted,
      );

      if (!hasScrolledInitialHashRef.current && window.location.hash) {
        const targetId = decodeURIComponent(window.location.hash.slice(1));
        const matched = extracted.some((item) => item.id === targetId);
        if (matched) {
          hasScrolledInitialHashRef.current = true;
          document.getElementById(targetId)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    };

    syncHeadings();

    // Re-scan if async/Suspense blocks stream additional headings into the article body.
    const observer = new MutationObserver(() => {
      syncHeadings();
    });
    observer.observe(container, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [enabled]);

  const handleLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    targetId: string,
  ) => {
    const target = document.getElementById(targetId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.pushState(null, "", `#${targetId}`);
  };

  return (
    <div className={cn("mt-8", className)}>
      {enabled && items.length > 0 && (
        <nav
          aria-label={t("tableOfContents")}
          className="mb-8 rounded-xl border border-gray-200 bg-gray-50/80 shadow-xs"
        >
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-label={
              isOpen ? t("collapseTableOfContents") : t("expandTableOfContents")
            }
            onClick={() => setIsOpen((prev) => !prev)}
            className="hover:bg-primary-50/60 focus-visible:ring-primary-600 flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <span className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <List
                className="text-primary-700 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>{t("tableOfContents")}</span>
            </span>
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "size-4 shrink-0 text-gray-500 transition-transform duration-200",
                isOpen && "rotate-180",
              )}
            />
          </button>

          {isOpen && (
            <div id={panelId} className="border-t border-gray-200 px-4 py-3">
              <ul className="space-y-1.5 text-sm leading-relaxed">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className={cn(
                      item.level === 3 &&
                        "ml-4 border-l border-gray-200 pl-3 text-[13px]",
                    )}
                  >
                    <a
                      href={`#${item.id}`}
                      onClick={(event) => handleLinkClick(event, item.id)}
                      className={cn(
                        "hover:text-primary-700 focus-visible:ring-primary-600 block rounded py-0.5 transition-colors hover:underline focus-visible:ring-2 focus-visible:outline-none",
                        item.level === 2
                          ? "font-medium text-gray-800"
                          : "text-gray-600",
                      )}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>
      )}

      <div ref={contentRef}>{children}</div>
    </div>
  );
}
