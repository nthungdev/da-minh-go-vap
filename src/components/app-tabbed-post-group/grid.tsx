"use client";

import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import { Page } from "@/payload-types";
import { makePostsPath } from "@/utils/post";
import { Locale, useLocale } from "next-intl";
import TabbedPostGroupContent from "@/components/app-tabbed-post-group/content";
import AppTabbedPostGroupSelect from "@/components/app-tabbed-post-group/select";

const ALL_POSTS_CONTROL_LABELS: Record<Locale, string> = {
  en: "All",
  vi: "Tất cả",
};
const ALL_POSTS_TITLES: Record<Locale, string> = {
  en: "Posts",
  vi: "Các bài viết",
};

/** id should be provided when there are multiple AppPostTabGrid components on the same page */
interface AppPostTabGridAsyncProps
  extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  title?: string;
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

export default function AppTabbedPostGroupGrid({
  id,
  title,
  postGroups: _postGroups,
  className,
  ...props
}: AppPostTabGridAsyncProps) {
  const locale = useLocale();

  const allUniqueHiddenTags = Array.from(
    new Set(_postGroups.flatMap((group) => group.hiddenTags)),
  );

  const postGroups = [
    {
      title: ALL_POSTS_CONTROL_LABELS[locale],
      hiddenTags: allUniqueHiddenTags,
      limit: 6,
      viewMoreButton: {
        enable: true,
        relativeUrl: makePostsPath(
          allUniqueHiddenTags,
          ALL_POSTS_TITLES[locale],
        ),
      },
    },
    ..._postGroups,
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentGroup = postGroups[currentIndex];
  if (!currentGroup) return null;

  // lg breakpoint has a different layout
  return (
    <div className={twMerge(className)} id={id} {...props}>
      <div
        className={
          "bg-primary flex flex-row items-center justify-between gap-x-8 rounded-t-md px-2 py-1.5 text-white md:px-6 lg:items-start"
        }
      >
        <div className="text-xl font-bold">{title}</div>
        <AppTabbedPostGroupSelect
          id={id}
          className="lg:hidden"
          activeIndex={currentIndex}
          options={postGroups.map((group) => ({ value: group.title }))}
          onChange={setCurrentIndex}
        />
        <ol
          role="tablist"
          aria-label="Select post group"
          className="hidden flex-1 flex-row flex-wrap justify-end gap-1 pt-1 pb-1 text-sm lg:flex"
        >
          {postGroups.map((g, index) => (
            <li
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={twMerge(
                "px-1 text-gray-100 hover:cursor-pointer hover:text-white",
                currentIndex === index && "font-bold text-white",
              )}
              role="tab"
              aria-selected={currentIndex === index}
              aria-controls={`group-${id}-${index}`}
              id={`tab-${index}`}
              tab-index={currentIndex === index ? 0 : 1}
            >
              {g.title}
            </li>
          ))}
        </ol>
      </div>

      <div>
        {postGroups.map((g, index) => (
          <TabbedPostGroupContent
            key={index}
            id={`group-${id}-${index}`}
            hiddenTags={g.hiddenTags}
            title={g.title}
            viewMoreButton={g.viewMoreButton}
            role="tabpanel"
            tab-index="0"
            aria-labelledby={`group-${index}`}
            hidden={currentIndex !== index}
          />
        ))}
      </div>
    </div>
  );
}
