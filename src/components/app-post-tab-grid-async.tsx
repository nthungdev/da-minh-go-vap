"use client";

import React, { ChangeEvent } from "react";
import AppPostGrid from "./app-post-grid";
import AppSelectBasic from "./app-select-basic";
import { twMerge } from "tailwind-merge";
import { Page } from "@/payload-types";
import AppPostTabContentAsync from "@/components/app-post-tab-content-async";
import { makePostsPath } from "@/utils/post";
import { Locale, useLocale } from "next-intl";

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
  const locale = useLocale();

  const ContentComponent = component ?? AppPostGrid;

  const allUniqueHiddenTags = Array.from(
    new Set(postGroups.flatMap((group) => group.hiddenTags)),
  );

  const postGroupsData = [
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
    ...postGroups,
  ];
  const postGroupsDataReversed = postGroupsData.toReversed();

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedGroup = postGroupsData.find(
      (group) => group.title === event.target.value,
    );

    if (selectedGroup) {
      const controls = document.querySelectorAll<HTMLButtonElement>(
        `#${id} nav button`,
      );
      const control = controls[postGroupsData.indexOf(selectedGroup)];

      if (control) {
        control.click();
      }
    }
  };

  return (
    <div className={twMerge("space-y-4", className)} id={id}>
      <div className="relative">
        <AppSelectBasic
          className="lg:hidden"
          defaultValue={ALL_POSTS_CONTROL_LABELS[locale]}
          options={[
            {
              value: ALL_POSTS_CONTROL_LABELS[locale],
            },
            ...postGroups.map((group) => ({
              value: group.title,
            })),
          ]}
          onChange={handleSelectChange}
        />
        <nav
          className="group hidden flex-row-reverse justify-end lg:flex"
          aria-label="Tabs"
          role="tablist"
          aria-orientation="horizontal"
        >
          {postGroupsDataReversed.map(({ title }, index) => (
            <button
              key={`${id}-control-${index}`}
              type="button"
              className={twMerge(
                "peer border-secondary-400 bg-primary-4 relative -mr-12 inline-flex items-center justify-center gap-x-2 rounded-full border-[6px] px-12 py-1 text-center text-xl font-bold text-nowrap text-white transition disabled:pointer-events-none disabled:opacity-50",
                "hs-tab-active:bg-primary-700 hs-tab-active:border-secondary-500 hs-tab-active:z-10",
                "hover:shadow-neon hover:border-secondary-300 hover:z-20",
                "focus:outline-hidden",
                index === postGroupsData.length - 1 && "active",
              )}
              aria-selected={false}
              role="tab"
              id={`${id}-control-${index}`}
              data-hs-tab={`#${id}-content-${index}`}
              aria-controls={`${id}-content-${index}`}
            >
              {title}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {postGroupsDataReversed.map(
          ({ title, hiddenTags, viewMoreButton }, index) => (
            <div
              key={`${id}-content-${index}`}
              id={`${id}-content-${index}`}
              className={
                index === postGroupsDataReversed.length - 1 ? "" : "hidden"
              }
              role="tabpanel"
              aria-labelledby={`${id}-control-${index}`}
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
