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
    <div className="flex w-[380px] max-w-[calc(100vw-2rem)] gap-3 p-card-sm sm:w-[600px] md:w-[820px] lg:w-[1040px] xl:w-[1200px]">
      {/* Left Sidebar Category Tabs */}
      <div className="flex w-48 shrink-0 flex-col gap-1 border-r border-border-subtle pr-3 sm:w-56">
        {categories.map((cat, idx) => {
          const isSelected = activeTabIndex === idx;
          const isRouteActive = cat.absoluteHref
            ? pathname === cat.absoluteHref
            : false;

          const tabContent = (
            <>
              <div className="flex items-center gap-2 truncate">
                {cat.icon && (
                  <span className="relative inline-block size-4 shrink-0 overflow-hidden rounded-pill bg-surface">
                    <Image
                      unoptimized
                      src={getMenuIconSrc(cat.icon)}
                      alt=""
                      aria-hidden="true"
                      fill
                      className="rounded-pill object-contain"
                    />
                  </span>
                )}
                <span className="truncate">{cat.name}</span>
              </div>
              {cat.absoluteHref && (
                <ChevronRight className="size-4 shrink-0 text-foreground-muted transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
              )}
            </>
          );

          const tabClassName = cn(
            "group flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:text-base",
            "hover:bg-surface-muted hover:text-primary focus:bg-surface-muted focus:text-primary",
            isSelected || isRouteActive
              ? "bg-accent font-semibold text-accent-foreground"
              : "text-foreground",
          );

          const categoryKey = `${cat.name}-${cat.absoluteHref}`;
          return cat.absoluteHref ? (
            <NavigationMenuLink
              key={categoryKey}
              className={tabClassName}
              render={
                <Link
                  href={cat.absoluteHref}
                  onFocus={() => setActiveTabIndex(idx)}
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
              onFocus={() => setActiveTabIndex(idx)}
              onClick={() => setActiveTabIndex(idx)}
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
