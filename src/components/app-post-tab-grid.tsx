"use client";

import React, { ChangeEvent } from "react";
import AppPostGrid from "./app-post-grid";
import AppSelectBasic from "./app-select-basic";
import { AppPost } from "@/definitions";
import { twMerge } from "tailwind-merge";
import { Page } from "@/payload-types";
import AppViewMoreLink from "@/components/app-view-more-link";
import { getDataOrUndefined } from "@/payload/utils/data";

const ALL_POSTS_CONTROL_LABEL = "Tất cả";

/** id should be provided when there are multiple AppPostTabGrid components on the same page */
interface AppPostTabGridProps extends React.HTMLAttributes<HTMLDivElement> {
  postGroups: {
    title: string;
    posts: AppPost[];
    limit: number;
    viewMoreButton?: {
      enable: boolean;
      relativeUrl: Page | string | undefined | null;
    };
  }[];
  allPostsLimit?: number;
  component?: React.ElementType;
}

export default function AppPostTabGrid(props: AppPostTabGridProps) {
  const { id, postGroups, className, allPostsLimit, component } = props;

  const ContentComponent = component ? component : AppPostGrid;

  const allPosts = postGroups
    .reduce((acc, { posts }) => [...acc, ...posts], [] as AppPost[])
    .toSorted((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, allPostsLimit);

  const postGroupsData = [
    {
      title: ALL_POSTS_CONTROL_LABEL,
      posts: allPosts,
      // TODO set proper values
      limit: 6,
      viewMoreButton: {
        enable: false,
        relativeUrl: "/posts",
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
      <div>
        <AppSelectBasic
          className="lg:hidden"
          defaultValue={ALL_POSTS_CONTROL_LABEL}
          options={[
            {
              value: ALL_POSTS_CONTROL_LABEL,
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
                "peer border-secondary-400 font-header relative -mr-12 inline-flex items-center justify-center gap-x-2 rounded-full border-[6px] bg-[#70C7D0] px-12 py-1 text-center text-xl font-bold text-nowrap text-white transition disabled:pointer-events-none disabled:opacity-50",
                "hs-tab-active:bg-primary hs-tab-active:border-secondary-500 hs-tab-active:z-10",
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
          ({ title, posts, viewMoreButton }, index) => (
            <AppPostTabContent
              key={`${id}-content-${index}`}
              id={`${id}-content-${index}`}
              className={
                index === postGroupsDataReversed.length - 1 ? "" : "hidden"
              }
              component={ContentComponent}
              posts={posts}
              role="tabpanel"
              aria-labelledby={`${id}-control-${index}`}
              title={title}
              viewMoreButton={viewMoreButton}
            />
          ),
        )}
      </div>
    </div>
  );
}

interface AppPostTabContentProps extends React.HTMLAttributes<HTMLDivElement> {
  component?: React.ElementType;
  title: string;
  posts: AppPost[];
  viewMoreButton?: {
    enable: boolean;
    relativeUrl: Page | string | undefined | null;
  };
}

function AppPostTabContent({
  className,
  component,
  posts,
  viewMoreButton,
  ...props
}: AppPostTabContentProps) {
  const DataComponent = component ? component : AppPostGrid;

  const page = getDataOrUndefined<Page>(viewMoreButton?.relativeUrl);

  const viewMoreHref = page ? page.path : "";

  return (
    <div className={twMerge(className)} role="tabpanel" {...props}>
      <DataComponent className="lg:grid-cols-3" posts={posts} />
      {viewMoreButton?.enable && (
        <div className="flex flex-row justify-end">
          <AppViewMoreLink href={viewMoreHref} />
        </div>
      )}
    </div>
  );
}
