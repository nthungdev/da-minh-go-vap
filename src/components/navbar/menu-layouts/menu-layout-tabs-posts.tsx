"use client";

import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { MenuItem } from "@/utils/menu";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const categories = item.categories || [];
  if (categories.length === 0) {
    return null;
  }

  const activeCategory = categories[activeTabIndex] || categories[0];

  return (
    <div className="flex w-[380px] gap-3.5 p-4 sm:w-[600px] md:w-[820px] lg:w-[1040px] xl:w-[1200px]">
      {/* Left Sidebar Category Tabs */}
      <div className="border-primary-500/30 flex w-48 shrink-0 flex-col gap-1.5 border-r pr-3.5 sm:w-60">
        {categories.map((cat, idx) => {
          const isSelected = activeTabIndex === idx;
          const isRouteActive = cat.absoluteHref
            ? pathname === cat.absoluteHref
            : false;

          return (
            <button
              key={idx}
              type="button"
              onMouseEnter={() => setActiveTabIndex(idx)}
              onClick={() => {
                setActiveTabIndex(idx);
                if (cat.absoluteHref) {
                  router.push(cat.absoluteHref);
                }
              }}
              className={twMerge(
                "group flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-left text-base font-medium transition-colors select-none",
                isSelected
                  ? "bg-primary-700 font-semibold text-white shadow-xs"
                  : "hover:bg-primary-700/50 text-gray-200 hover:text-white",
                isRouteActive &&
                  !isSelected &&
                  "text-white underline underline-offset-4",
              )}
            >
              <span className="truncate">{cat.name}</span>
              {cat.absoluteHref && (
                <ChevronRight className="size-4 shrink-0 opacity-60 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
              )}
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
                      <div className="flex h-full w-full items-center justify-center text-base text-gray-400">
                        No image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
                  </div>
                  <div className="p-2.5">
                    <h4 className="line-clamp-2 text-base leading-snug font-semibold text-white group-hover:text-white">
                      {post.title}
                    </h4>
                  </div>
                </NavigationMenuLink>
              );
            })}
          </div>
        ) : (
          <div className="border-primary-500/30 flex h-48 w-full items-center justify-center rounded-lg border border-dashed text-base text-gray-300">
            Chưa có bài viết nào cho danh mục này.
          </div>
        )}
      </div>
    </div>
  );
}
