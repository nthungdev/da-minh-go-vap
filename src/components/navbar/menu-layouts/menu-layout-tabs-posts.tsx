"use client";

import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { MenuItem } from "@/utils/menu";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

interface MenuLayoutTabsPostsProps {
  item: MenuItem;
  pathname: string;
}

export default function MenuLayoutTabsPosts({
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
    <div className="flex w-[380px] gap-2 p-2 sm:w-[600px] md:w-[820px] lg:w-[1040px] xl:w-[1200px]">
      {/* Left Sidebar Category Tabs */}
      <div className="flex w-48 shrink-0 flex-col gap-1 border-r border-gray-100 pr-2 sm:w-56">
        {categories.map((cat, idx) => {
          const isSelected = activeTabIndex === idx;
          const isRouteActive = cat.absoluteHref
            ? pathname === cat.absoluteHref
            : false;

          const tabContent = (
            <>
              <span className="truncate">{cat.name}</span>
              {cat.absoluteHref && (
                <ChevronRight className="size-4 shrink-0 text-gray-400 transition-all group-hover:translate-x-0.5 group-hover:text-gray-600" />
              )}
            </>
          );

          const tabClassName = twMerge(
            "group flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-base transition-colors outline-none select-none",
            "hover:bg-gray-100 focus:bg-gray-100",
            isSelected
              ? "bg-gray-100 font-semibold text-gray-900"
              : "text-gray-700 hover:text-gray-900",
            isRouteActive && "bg-primary-50 font-semibold text-gray-700",
          );

          return cat.absoluteHref ? (
            <NavigationMenuLink
              key={idx}
              className={tabClassName}
              render={
                <Link
                  href={cat.absoluteHref}
                  onMouseEnter={() => setActiveTabIndex(idx)}
                />
              }
            >
              {tabContent}
            </NavigationMenuLink>
          ) : (
            <button
              key={idx}
              type="button"
              onMouseEnter={() => setActiveTabIndex(idx)}
              className={tabClassName}
            >
              {tabContent}
            </button>
          );
        })}
      </div>

      {/* Right Content Area: Post Grid */}
      <div className="flex-1 pl-1">
        {activeCategory &&
        activeCategory.posts &&
        activeCategory.posts.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {activeCategory.posts.map((post, pIdx) => {
              const isPostActive = pathname === post.href;

              return (
                <NavigationMenuLink
                  key={pIdx}
                  className="p-0 text-left"
                  render={
                    <Link
                      href={post.href}
                      className={twMerge(
                        "group flex flex-col overflow-hidden rounded-md p-1.5 text-left transition-colors outline-none select-none",
                        "hover:bg-gray-100 focus:bg-gray-100",
                        isPostActive && "bg-gray-100",
                      )}
                    />
                  }
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md bg-gray-300">
                    {post.thumbnail?.url ? (
                      <Image
                        src={post.thumbnail.url}
                        alt={post.thumbnail.alt || post.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="px-1 pt-2 pb-0.5">
                    <h4
                      className={twMerge(
                        "line-clamp-2 text-base leading-snug font-semibold text-gray-900 transition-colors group-hover:text-gray-700",
                        isPostActive && "text-gray-700",
                      )}
                    >
                      {post.title}
                    </h4>
                  </div>
                </NavigationMenuLink>
              );
            })}
          </div>
        ) : (
          <div className="flex h-48 w-full items-center justify-center rounded-md border border-dashed border-gray-200 text-base text-gray-500">
            Chưa có bài viết nào cho danh mục này.
          </div>
        )}
      </div>
    </div>
  );
}
