"use client";

import { useTranslations } from "next-intl";
import { useId, useRef, useState } from "react";
import { getTabIndexForKey } from "@/components/app-card-tabs";
import PostGroupTabsPanel from "@/components/post-group-tabs/panel";
import PostGroupTabsSelect from "@/components/post-group-tabs/select";
import type { AppPost } from "@/definitions";
import type { Page } from "@/payload-types";
import { cn } from "@/utils/common";

interface PostGroupTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  initialPosts?: AppPost[];
  viewMoreButton?: {
    enable: boolean;
    relativeUrl: Page | string | undefined | null;
  };
  groups: {
    title: string;
    hiddenTags: string[];
    limit: number;
    viewMoreButton?: {
      enable: boolean;
      relativeUrl: Page | string | undefined | null;
    };
  }[];
}

function PostGroupTabs({
  title,
  viewMoreButton,
  groups,
  className,
  initialPosts,
  ...props
}: PostGroupTabsProps) {
  const fallbackId = useId();
  const id = (title ?? fallbackId).replace(/\s+/g, "-").toLowerCase();

  const t = useTranslations();

  const allUniqueHiddenTags = Array.from(
    new Set(groups.flatMap((group) => group.hiddenTags)),
  );

  const postGroups = [
    {
      title: t("common.all"),
      hiddenTags: allUniqueHiddenTags,
      limit: 6,
      viewMoreButton,
    },
    ...groups,
  ];

  const [selectedIndex, setCurrentIndex] = useState(0);
  const currentIndex = selectedIndex < postGroups.length ? selectedIndex : 0;
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  return (
    <div className={cn(className)} id={id} {...props}>
      <div
        className={
          "flex flex-row items-center justify-between gap-x-8 rounded-t-md bg-primary-800 px-2 py-1.5 text-white md:px-6 lg:items-start"
        }
      >
        {title && (
          <h2 id={`${fallbackId}-heading`} className="text-xl font-bold">
            {title}
          </h2>
        )}
        <PostGroupTabsSelect
          id={`${fallbackId}-select`}
          className="lg:hidden"
          activeIndex={currentIndex}
          options={postGroups.map((group) => ({ value: group.title }))}
          onChange={setCurrentIndex}
        />
        <div
          role="tablist"
          aria-labelledby={title ? `${fallbackId}-heading` : undefined}
          aria-label={title ? undefined : t("navigation.selectPostGroup")}
          className="hidden flex-1 flex-row flex-wrap justify-end gap-x-2 gap-y-1 pt-1 pb-1 lg:flex"
        >
          {postGroups.map((g, index) => {
            const groupKey = `${g.title}-${g.hiddenTags.join(",")}`;
            return (
              <div key={groupKey} className="flex flex-row gap-x-3 px-1">
                {index !== 0 && <div className="border-l" />}
                <button
                  type="button"
                  ref={(button) => {
                    tabRefs.current[index] = button;
                  }}
                  onClick={() => setCurrentIndex(index)}
                  onKeyDown={(event) => {
                    const nextIndex = getTabIndexForKey(
                      event.key,
                      index,
                      postGroups.length,
                    );
                    if (nextIndex === undefined) return;
                    event.preventDefault();
                    setCurrentIndex(nextIndex);
                    tabRefs.current[nextIndex]?.focus();
                  }}
                  role="tab"
                  aria-selected={currentIndex === index}
                  aria-controls={`group-${fallbackId}-${index}`}
                  id={`tab-${fallbackId}-${index}`}
                  tabIndex={currentIndex === index ? 0 : -1}
                  className={cn(
                    "rounded-sm px-1 text-gray-100 transition-transform hover:cursor-pointer hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none motion-safe:hover:scale-x-105 motion-reduce:transition-none",
                    currentIndex === index && "font-bold text-white",
                  )}
                >
                  {g.title}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        {postGroups.map((g, index) => {
          const groupKey = `${g.title}-${g.hiddenTags.join(",")}`;
          return (
            <PostGroupTabsPanel
              key={groupKey}
              id={`group-${fallbackId}-${index}`}
              hiddenTags={g.hiddenTags}
              title={g.title}
              initialPosts={index === 0 ? initialPosts : undefined}
              viewMoreButton={g.viewMoreButton}
              role="tabpanel"
              tabIndex={0}
              aria-labelledby={`tab-${fallbackId}-${index}`}
              hidden={currentIndex !== index}
            />
          );
        })}
      </div>
    </div>
  );
}

export default PostGroupTabs;
