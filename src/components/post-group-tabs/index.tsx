"use client";

import PostGroupTabsPanel from "@/components/post-group-tabs/panel";
import PostGroupTabsSelect from "@/components/post-group-tabs/select";
import { Locale } from "@/i18n/config";
import { Page } from "@/payload-types";
import { useLocale } from "next-intl";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

const ALL_POSTS_CONTROL_LABELS: Record<Locale, string> = {
  en: "All",
  vi: "Tất cả",
};

interface PostGroupTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
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
  ...props
}: PostGroupTabsProps) {
  const id = (title ?? Math.random().toString())
    .replace(/\s+/g, "-")
    .toLowerCase();

  const locale = useLocale();

  const allUniqueHiddenTags = Array.from(
    new Set(groups.flatMap((group) => group.hiddenTags)),
  );

  const postGroups = [
    {
      title: ALL_POSTS_CONTROL_LABELS[locale],
      hiddenTags: allUniqueHiddenTags,
      limit: 6,
      viewMoreButton,
    },
    ...groups,
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentGroup = postGroups[currentIndex];
  if (!currentGroup) return null;

  return (
    <div className={twMerge(className)} id={id} {...props}>
      <div
        className={
          "bg-primary flex flex-row items-center justify-between gap-x-8 rounded-t-md px-2 py-1.5 text-white md:px-6 lg:items-start"
        }
      >
        <div className="text-xl font-bold">{title}</div>
        <PostGroupTabsSelect
          id={id}
          className="lg:hidden"
          activeIndex={currentIndex}
          options={postGroups.map((group) => ({ value: group.title }))}
          onChange={setCurrentIndex}
        />
        <ol
          role="tablist"
          aria-label="Select post group"
          className="hidden flex-1 flex-row flex-wrap justify-end gap-x-2 gap-y-1 pt-1 pb-1 lg:flex"
        >
          {postGroups.map((g, index) => (
            <li
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={twMerge("flex flex-row gap-x-3 px-1")}
              role="tab"
              aria-selected={currentIndex === index}
              aria-controls={`group-${id}-${index}`}
              id={`tab-${index}`}
              tab-index={currentIndex === index ? 0 : 1}
            >
              {index !== 0 && <div className="border-l"></div>}
              <span
                className={twMerge(
                  "text-gray-100 transition-transform hover:scale-x-105 hover:cursor-pointer hover:text-white",
                  currentIndex === index && "font-bold text-white",
                )}
              >
                {g.title}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div>
        {postGroups.map((g, index) => (
          <PostGroupTabsPanel
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

export default PostGroupTabs;
