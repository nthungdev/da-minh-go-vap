"use client";

import { useTranslations } from "next-intl";
import type React from "react";
import type { ChangeEvent } from "react";
import AppPostTabContentAsync from "@/components/app-post-tab-content-async";
import type { Page } from "@/payload-types";
import { cn } from "@/utils/common";
import { makePostsPath } from "@/utils/post";
import AppPostGrid from "./app-post-grid";
import AppSelectBasic from "./app-select-basic";

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
  const t = useTranslations();

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
  const postGroupsDataReversed = postGroupsData.toReversed();

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedGroup = postGroupsData.find(
      (group) => group.title === event.target.value,
    );

    if (selectedGroup) {
      const controls = document.querySelectorAll<HTMLButtonElement>(
        `#${id} [role="tablist"] button`,
      );
      const control = controls[postGroupsData.indexOf(selectedGroup)];

      if (control) {
        control.click();
      }
    }
  };

  return (
    <div className={cn("space-y-4", className)} id={id}>
      <div className="relative">
        <AppSelectBasic
          className="lg:hidden"
          defaultValue={t("common.all")}
          options={[
            {
              value: t("common.all"),
            },
            ...postGroups.map((group) => ({
              value: group.title,
            })),
          ]}
          onChange={handleSelectChange}
        />
        <div
          className="group hidden flex-row-reverse justify-end lg:flex"
          aria-label={t("navigation.postGroups")}
          role="tablist"
          aria-orientation="horizontal"
        >
          {postGroupsDataReversed.map(({ title }, index) => (
            <button
              key={`${id}-control-${title}`}
              type="button"
              className={cn(
                "peer relative -mr-12 inline-flex items-center justify-center gap-x-2 rounded-full border-[6px] border-secondary-400 bg-primary-4 px-12 py-1 text-center text-xl font-bold text-nowrap text-white transition disabled:pointer-events-none disabled:opacity-50",
                "hs-tab-active:z-10 hs-tab-active:border-secondary-500 hs-tab-active:bg-primary-700",
                "hover:z-20 hover:border-secondary-300 hover:shadow-neon",
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
        </div>
      </div>

      <div>
        {postGroupsDataReversed.map(
          ({ title, hiddenTags, viewMoreButton }, index) => (
            <div
              key={`${id}-content-${title}`}
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
