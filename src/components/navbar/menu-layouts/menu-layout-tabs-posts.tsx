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
    <div className="flex w-[380px] gap-3.5 p-4 sm:w-[600px] md:w-[820px] lg:w-[1040px] xl:w-[1200px]">
      {/* Left Sidebar Category Tabs */}
      <div className="flex w-48 shrink-0 flex-col gap-1.5 border-r border-gray-200 pr-3.5 sm:w-60">
        {categories.map((cat, idx) => {
          const isSelected = activeTabIndex === idx;
          const isRouteActive = cat.absoluteHref
            ? pathname === cat.absoluteHref
            : false;

          const tabContent = (
            <>
              <span className="truncate">{cat.name}</span>
              {cat.absoluteHref && (
                <ChevronRight className="size-4 shrink-0 opacity-60 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
              )}
            </>
          );

          const tabClassName = twMerge(
            "group flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-left text-base font-medium transition-colors select-none",
            isSelected
              ? "bg-gray-100 font-semibold text-gray-900 shadow-xs"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
            isRouteActive &&
              !isSelected &&
              "text-primary-700 font-semibold underline underline-offset-4",
          );

          return cat.absoluteHref ? (
            <NavigationMenuLink
              key={idx}
              className="p-0 hover:bg-transparent focus:bg-transparent"
              render={
                <Link
                  href={cat.absoluteHref}
                  onMouseEnter={() => setActiveTabIndex(idx)}
                  className={tabClassName}
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
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
            {activeCategory.posts.map((post, pIdx) => {
              const isPostActive = pathname === post.href;

              return (
                <NavigationMenuLink
                  key={pIdx}
                  render={
                    <Link
                      href={post.href}
                      className={twMerge(
                        "group flex flex-col overflow-hidden rounded-lg border border-gray-100 bg-white transition-all hover:bg-gray-50 hover:shadow-md focus:outline-none",
                        isPostActive && "ring-primary-600 ring-2",
                      )}
                    />
                  }
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                    {post.thumbnail?.url ? (
                      <Image
                        src={post.thumbnail.url}
                        alt={post.thumbnail.alt || post.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-base text-gray-400">
                        No image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 transition-opacity group-hover:opacity-60" />
                  </div>
                  <div className="p-2.5">
                    <h4 className="group-hover:text-primary-700 line-clamp-2 text-base leading-snug font-semibold text-gray-900">
                      {post.title}
                    </h4>
                  </div>
                </NavigationMenuLink>
              );
            })}
          </div>
        ) : (
          <div className="flex h-48 w-full items-center justify-center rounded-lg border border-dashed border-gray-200 text-base text-gray-500">
            Chưa có bài viết nào cho danh mục này.
          </div>
        )}
      </div>
    </div>
  );
}
