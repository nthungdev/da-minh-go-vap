"use client";

import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { MenuItem } from "@/utils/menu";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

interface MenuLayoutTabsPostsProps {
  item: MenuItem;
  pathname: string;
}

export function MenuLayoutTabsPosts({
  item,
  pathname,
}: MenuLayoutTabsPostsProps) {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const categories = item.categories || [];
  if (categories.length === 0) {
    return null;
  }

  const activeCategory = categories[activeTabIndex] || categories[0];

  return (
    <div className="flex w-[360px] gap-3 p-4 sm:w-[560px] md:w-[760px] lg:w-[980px] xl:w-[1120px]">
      {/* Left Sidebar Category Tabs */}
      <div className="border-primary-500/30 flex w-40 shrink-0 flex-col gap-1 border-r pr-3 sm:w-52">
        {categories.map((cat, idx) => {
          const isSelected = activeTabIndex === idx;
          const isRouteActive = pathname === cat.absoluteHref;

          return (
            <button
              key={idx}
              type="button"
              onMouseEnter={() => setActiveTabIndex(idx)}
              onClick={() => setActiveTabIndex(idx)}
              className={twMerge(
                "flex w-full items-center rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors select-none",
                isSelected
                  ? "bg-primary-700 font-semibold text-white shadow-xs"
                  : "hover:bg-primary-700/50 text-gray-200 hover:text-white",
                isRouteActive &&
                  !isSelected &&
                  "text-white underline underline-offset-4",
              )}
            >
              <span className="truncate">{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Right Content Area: Post Grid */}
      <div className="flex-1 pl-1">
        {activeCategory &&
        activeCategory.posts &&
        activeCategory.posts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {activeCategory.posts.map((post, pIdx) => {
              const isPostActive = pathname === post.href;

              return (
                <NavigationMenuLink
                  key={pIdx}
                  render={
                    <Link
                      href={post.href}
                      className={twMerge(
                        "group bg-primary-800/60 hover:bg-primary-800 flex flex-col overflow-hidden rounded-lg transition-all hover:shadow-md focus:outline-none",
                        isPostActive && "ring-2 ring-white/80",
                      )}
                    />
                  }
                >
                  <div className="bg-primary-900 relative aspect-[16/10] w-full overflow-hidden">
                    {post.thumbnail?.url ? (
                      <Image
                        src={post.thumbnail.url}
                        alt={post.thumbnail.alt || post.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        No image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
                  </div>
                  <div className="p-2">
                    <h4 className="line-clamp-2 text-xs leading-snug font-semibold text-white group-hover:text-white">
                      {post.title}
                    </h4>
                  </div>
                </NavigationMenuLink>
              );
            })}
          </div>
        ) : (
          <div className="border-primary-500/30 flex h-48 w-full items-center justify-center rounded-lg border border-dashed text-xs text-gray-300">
            Chưa có bài viết nào cho danh mục này.
          </div>
        )}
      </div>
    </div>
  );
}
