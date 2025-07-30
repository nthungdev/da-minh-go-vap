"use client";

import { ChangeEvent } from "react";
import AppPostGrid from "./app-post-grid";
import AppSelectBasic from "./app-select-basic";
import { AppPost } from "@/definitions";
import { twMerge } from "tailwind-merge";

const ALL_POSTS_CONTROL_LABEL = "Tất cả";

interface AppPostTabGridProps {
  /** id should be provided when there are multiple AppPostTabGrid components on the same page */
  id?: string;
  className?: string;
  postGroups: {
    title: string;
    posts: AppPost[];
  }[];
  allPostsLimit?: number;
  component?: React.ElementType;
}

export default function AppPostTabGrid(props: AppPostTabGridProps) {
  const {
    id = "post-tab-grid",
    postGroups,
    className,
    allPostsLimit,
    component,
  } = props;

  const DataComponent = component ? component : AppPostGrid;

  const allPosts = postGroups
    .reduce((acc, { posts }) => [...acc, ...posts], [] as AppPost[])
    .toSorted((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, allPostsLimit);

  const postGroupsData = [
    {
      title: ALL_POSTS_CONTROL_LABEL,
      posts: allPosts,
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
    <div className={`space-y-4 ${className}`} id={id}>
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
        {postGroupsDataReversed.map(({ posts }, index) => (
          <div
            key={`${id}-content-${index}`}
            id={`${id}-content-${index}`}
            className={
              index === postGroupsDataReversed.length - 1 ? "" : "hidden"
            }
            role="tabpanel"
            aria-labelledby={`${id}-control-${index}`}
          >
            <DataComponent className="lg:grid-cols-3" posts={posts} />
          </div>
        ))}
      </div>
    </div>
  );
}
