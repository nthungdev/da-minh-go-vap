"use client";

import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { getMenuIconSrc } from "@/definitions/menu-icons";
import { cn } from "@/utils/common";
import type { MenuItem } from "@/utils/menu";
import type { MenuCategoryPosts } from "@/utils/menu-category-posts";
import { getCategoryPostsKey } from "@/utils/streaming";
import {
  MenuCategoryPostsGrid,
  MenuCategoryPostsSkeleton,
} from "./menu-category-posts";

interface MenuLayoutTabsPostsProps {
  item: MenuItem;
  pathname: string;
  categoryPostsPromise: Promise<MenuCategoryPosts>;
}

export default function MenuLayoutTabsPosts({
  item,
  pathname,
  categoryPostsPromise,
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
              <div className="flex items-center gap-2 truncate">
                {cat.icon && (
                  <span className="relative inline-block size-4 shrink-0 overflow-hidden rounded-full bg-white">
                    <Image
                      unoptimized
                      src={getMenuIconSrc(cat.icon)}
                      alt={cat.name || cat.icon}
                      fill
                      className="rounded-full object-contain"
                    />
                  </span>
                )}
                <span className="truncate">{cat.name}</span>
              </div>
              {cat.absoluteHref && (
                <ChevronRight className="group-hover:text-primary-600 size-4 shrink-0 text-gray-400 transition-all group-hover:translate-x-0.5" />
              )}
            </>
          );

          const tabClassName = cn(
            "group flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-base transition-colors outline-none select-none",
            "hover:bg-gray-200 hover:text-primary-700 focus:bg-gray-200 focus:text-primary-700",
            isSelected
              ? "bg-gray-200 font-semibold text-primary-700"
              : "text-gray-700 hover:text-primary-700",
            isRouteActive && "bg-gray-200 font-semibold text-primary-700",
          );

          const categoryKey = `${cat.name}-${cat.absoluteHref}`;
          return cat.absoluteHref ? (
            <NavigationMenuLink
              key={categoryKey}
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
              key={categoryKey}
              type="button"
              onMouseEnter={() => setActiveTabIndex(idx)}
              className={tabClassName}
            >
              {tabContent}
            </button>
          );
        })}
      </div>

      {/* Right Content Area: Post Grid (streams in after the navbar shell) */}
      <div className="flex-1 pl-1">
        <Suspense fallback={<MenuCategoryPostsSkeleton />}>
          <MenuCategoryPostsGrid
            postsPromise={categoryPostsPromise}
            categoryKey={getCategoryPostsKey(activeCategory?.tagIds ?? [])}
            pathname={pathname}
          />
        </Suspense>
      </div>
    </div>
  );
}
