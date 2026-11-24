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

  const postGroupsData = [
    {
      title: t("common.all"),
      hiddenTags: allUniqueHiddenTags,
      limit: 6,
      viewMoreButton: {
        enable: true,
        relativeUrl: makePostsPath(allUniqueHiddenTags, t("posts.allPosts")),
      },
    },
    ...postGroups,
  ];
  const activeIndex = selectedIndex < postGroupsData.length ? selectedIndex : 0;

  return (
    <div className={cn("space-y-4", className)} id={id}>
      <div className="relative">
        <select
          className="min-h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-center text-sm focus-visible:ring-2 focus-visible:ring-primary-800 focus-visible:outline-none lg:hidden"
          aria-label={t("navigation.selectPostGroup")}
          value={activeIndex}
          onChange={(event) => setSelectedIndex(Number(event.target.value))}
        >
          {postGroupsData.map(({ title, hiddenTags }, index) => (
            <option key={`${title}-${hiddenTags.join(",")}`} value={index}>
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
          {postGroupsData.map(({ title, hiddenTags }, index) => (
            <button
              key={`${title}-${hiddenTags.join(",")}`}
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
                "peer relative -mr-12 inline-flex items-center justify-center gap-x-2 rounded-full border-[6px] border-secondary-400 bg-primary-900 px-12 py-1 text-center text-xl font-bold text-nowrap text-white transition disabled:pointer-events-none disabled:opacity-50",
                "hover:z-20 hover:border-secondary-300 hover:shadow-neon",
                "focus-visible:z-20 focus-visible:ring-2 focus-visible:ring-primary-800 focus-visible:outline-none motion-reduce:transition-none",
                activeIndex === index &&
                  "z-10 border-secondary-500 bg-primary-800",
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
        {postGroupsData.map(({ title, hiddenTags, viewMoreButton }, index) => (
          <div
            key={`${title}-${hiddenTags.join(",")}`}
            id={`${tabsId}-content-${index}`}
            hidden={activeIndex !== index}
            role="tabpanel"
            aria-labelledby={`${tabsId}-control-${index}`}
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
        ))}
      </div>
    </div>
  );
}
