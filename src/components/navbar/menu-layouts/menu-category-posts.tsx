"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { use } from "react";
import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";
import type { MenuCategoryPosts } from "@/utils/menu-category-posts";
import { makePostPath } from "@/utils/post";

const GRID_CLASS_NAME = "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4";
const SKELETON_CARD_KEYS = [
  "skeleton-1",
  "skeleton-2",
  "skeleton-3",
  "skeleton-4",
  "skeleton-5",
  "skeleton-6",
  "skeleton-7",
  "skeleton-8",
] as const;

interface MenuCategoryPostsGridProps {
  postsPromise: Promise<MenuCategoryPosts>;
  categoryKey: string;
  pathname: string;
}

/** Post cards for the active mega-menu category; suspends until posts load. */
export function MenuCategoryPostsGrid({
  postsPromise,
  categoryKey,
  pathname,
}: MenuCategoryPostsGridProps) {
  const t = useTranslations("navigation");
  const posts = use(postsPromise)[categoryKey] ?? [];

  if (posts.length === 0) {
    return (
      <div className="flex h-48 w-full items-center justify-center rounded-xl border border-dashed border-border bg-surface-muted/40 p-card text-base text-foreground-muted">
        {t("emptyCategory")}
      </div>
    );
  }

  return (
    <div className={GRID_CLASS_NAME}>
      {posts.map((post, pIdx) => {
        const postHref = post.href || makePostPath(post.slug);
        const isPostActive = pathname === postHref;

        return (
          <NavigationMenuLink
            key={post.slug || `${categoryKey}-${pIdx}`}
            className="p-0 text-left"
            render={
              <Link
                href={postHref}
                className={cn(
                  "group flex flex-col overflow-hidden rounded-xl p-1.5 text-left transition-colors outline-none select-none",
                  "hover:bg-surface-muted focus:bg-surface-muted focus-visible:ring-2 focus-visible:ring-ring",
                  isPostActive && "bg-accent",
                )}
              />
            }
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-surface-muted">
              {post.thumbnail?.url ? (
                <Image
                  key={post.thumbnail.url}
                  src={transformUrl(post.thumbnail.url, { width: "300" })}
                  alt={post.thumbnail.alt || post.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-foreground-muted">
                  No image
                </div>
              )}
            </div>
            <div className="px-1 pt-2 pb-0.5">
              <h4
                className={cn(
                  "line-clamp-2 text-sm leading-snug font-semibold text-foreground transition-colors group-hover:text-primary sm:text-base",
                  isPostActive && "text-accent-foreground",
                )}
              >
                {post.title}
              </h4>
            </div>
          </NavigationMenuLink>
        );
      })}
    </div>
  );
}

/** Same grid geometry as `MenuCategoryPostsGrid`, shown while posts stream. */
export function MenuCategoryPostsSkeleton() {
  return (
    <div className={GRID_CLASS_NAME} aria-busy="true">
      {SKELETON_CARD_KEYS.map((skeletonKey) => (
        <div
          key={skeletonKey}
          className="flex flex-col p-1.5 motion-safe:animate-pulse"
          aria-hidden="true"
        >
          <div className="aspect-[16/10] w-full rounded-lg bg-surface-muted" />
          {/* flex-col stops margin collapse: two 22px lines (leading-snug base) */}
          <div className="flex flex-col px-1 pt-2 pb-0.5">
            <div className="my-[3px] h-4 w-full rounded-sm bg-surface-muted" />
            <div className="my-[3px] h-4 w-2/3 rounded-sm bg-surface-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
