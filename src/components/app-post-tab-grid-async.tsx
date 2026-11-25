"use client";

import { useTranslations } from "next-intl";
import { useId, useRef, useState } from "react";
import { getTabIndexForKey } from "@/components/app-card-tabs";
import AppPostTabContentAsync from "@/components/app-post-tab-content-async";
import type { Page } from "@/payload-types";
import { cn } from "@/utils/common";
import { makePostsPath } from "@/utils/post";
import AppPostGrid from "./app-post-grid";

interface AppPostTabGridAsyncProps
  extends React.HTMLAttributes<HTMLDivElement> {
  component?: React.ElementType;
  postGroups: {
    title: string;
    hiddenTags: string[];
    limit: number;
    viewMoreButton?: {
      enable: boolean;
      relativeUrl: Page | string | undefined | null;
    };
  }[];
}

export default function AppPostTabGridAsync(props: AppPostTabGridAsyncProps) {
  const { id, postGroups, className, component } = props;
  const t = useTranslations();
  const tabsId = useId();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const ContentComponent = component ?? AppPostGrid;

  const allUniqueHiddenTags = Array.from(
    new Set(postGroups.flatMap((group) => group.hiddenTags)),
  );

  const rawGroups = [
    {
      scope: "all",
      title: t("common.all"),
      hiddenTags: allUniqueHiddenTags,
      limit: 6,
      viewMoreButton: {
        enable: true,
        relativeUrl: makePostsPath(allUniqueHiddenTags, t("posts.allPosts")),
      },
    },
    ...postGroups.map((group) => ({ scope: "group", ...group })),
  ];

  // Disambiguate duplicate group titles/tags so option, tab, and panel keys stay unique
  const keyCounts = new Map<string, number>();
  const postGroupsData = rawGroups.map((group) => {
    const baseKey = `${group.scope}-${group.title}-${group.hiddenTags.join(",")}`;
    const occurrence = (keyCounts.get(baseKey) ?? 0) + 1;
    keyCounts.set(baseKey, occurrence);
    return {
      ...group,
      groupKey: occurrence === 1 ? baseKey : `${baseKey}-${occurrence}`,
    };
  });
  const activeIndex = selectedIndex < postGroupsData.length ? selectedIndex : 0;

  return (
    <div className={cn("space-y-stack", className)} id={id}>
      <div className="relative">
        <select
          className="min-h-11 w-full rounded-lg border border-input bg-surface px-3 text-center text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none lg:hidden"
          aria-label={t("navigation.selectPostGroup")}
          value={activeIndex}
          onChange={(event) => setSelectedIndex(Number(event.target.value))}
        >
          {postGroupsData.map(({ groupKey, title }, index) => (
            <option key={groupKey} value={index}>
              {title}
            </option>
          ))}
        </select>
        <div
          className="hidden lg:flex"
          aria-label={t("navigation.postGroups")}
          role="tablist"
          aria-orientation="horizontal"
        >
          {postGroupsData.map(({ groupKey, title }, index) => (
            <button
              key={groupKey}
              type="button"
              ref={(button) => {
                tabRefs.current[index] = button;
              }}
              tabIndex={activeIndex === index ? 0 : -1}
              onClick={() => setSelectedIndex(index)}
              onKeyDown={(event) => {
                const nextIndex = getTabIndexForKey(
                  event.key,
                  index,
                  postGroupsData.length,
                );
                if (nextIndex === undefined) return;
                event.preventDefault();
                setSelectedIndex(nextIndex);
                tabRefs.current[nextIndex]?.focus();
              }}
              className={cn(
                "peer relative -mr-12 inline-flex items-center justify-center gap-x-2 rounded-pill border-[6px] border-secondary-400 bg-primary-900 px-12 py-1 text-center text-xl font-bold text-nowrap text-white transition disabled:pointer-events-none disabled:opacity-50",
                "hover:z-20 hover:border-secondary-300 hover:shadow-neon",
                "focus-visible:z-20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none",
                activeIndex === index &&
                  "z-10 border-secondary-500 bg-primary text-primary-foreground",
              )}
              aria-selected={activeIndex === index}
              role="tab"
              id={`${tabsId}-control-${index}`}
              aria-controls={`${tabsId}-content-${index}`}
            >
              {title}
            </button>
          ))}
        </div>
      </div>

      <div>
        {postGroupsData.map(
          ({ groupKey, title, hiddenTags, viewMoreButton }, index) => (
            <div
              key={groupKey}
              id={`${tabsId}-content-${index}`}
              hidden={activeIndex !== index}
              role="tabpanel"
              aria-labelledby={`${tabsId}-control-${index}`}
              className="rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              // biome-ignore lint/a11y/noNoninteractiveTabindex: Loading and empty panels need a keyboard focus target.
              tabIndex={0}
            >
              <AppPostTabContentAsync
                component={ContentComponent}
                title={title}
                viewMoreButton={viewMoreButton}
                hiddenTags={hiddenTags}
              />
            </div>
          ),
        )}
      </div>
    </div>
  );
}
