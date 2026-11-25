import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { getMenuIconSrc } from "@/definitions/menu-icons";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";
import type {
  BottomBarItem,
  MenuIconType,
  MenuItem,
  PillarItem,
} from "@/utils/menu";

interface MenuLayoutPillarsProps {
  item: MenuItem;
  pathname: string;
}

const CONTAINER_WIDTH_BY_COUNT: Record<number, string> = {
  1: "w-[340px] sm:w-[380px]",
  2: "w-[380px] sm:w-[580px] md:w-[640px]",
  3: "w-[380px] sm:w-[580px] md:w-[760px] lg:w-[920px]",
};
const DEFAULT_CONTAINER_WIDTH =
  "w-[380px] sm:w-[580px] md:w-[760px] lg:w-[1020px] xl:w-[1180px]";

const GRID_COLS_BY_COUNT: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
};
const DEFAULT_GRID_COLS = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

function MenuLinkIcon({ icon }: { icon: MenuIconType }) {
  if (!icon) {
    return null;
  }

  return (
    <span className="relative inline-block size-4 shrink-0 overflow-hidden rounded-pill bg-surface">
      <Image
        unoptimized
        src={getMenuIconSrc(icon)}
        alt=""
        aria-hidden="true"
        sizes="16px"
        fill
        className="rounded-pill object-contain"
      />
    </span>
  );
}

function PillarColumn({
  pillar,
  pathname,
}: {
  pillar: PillarItem;
  pathname: string;
}) {
  const banner = pillar.headerBanner;
  const isBannerActive = Boolean(
    banner.absoluteHref && pathname === banner.absoluteHref,
  );

  const bannerCard = (
    <>
      {banner.image?.url && (
        <Image
          src={transformUrl(banner.image.url)}
          alt={banner.image.alt || banner.title}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
          fill
          className="object-cover transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-2.5">
        <div className="flex items-center justify-between gap-1">
          <div className="text-base leading-tight font-bold text-white">
            {banner.title}
          </div>
          {banner.absoluteHref && (
            <ChevronRight
              aria-hidden="true"
              className="size-4 shrink-0 text-white/80 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-white motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
            />
          )}
        </div>
        {banner.subtitle && (
          <div className="mt-0.5 line-clamp-1 text-sm text-white/85">
            {banner.subtitle}
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="flex flex-col gap-2">
      {/* Pillar Banner Card */}
      {banner.absoluteHref ? (
        <NavigationMenuLink
          className={cn(
            "group relative block h-28 w-full overflow-hidden rounded-md bg-ink p-0 transition-opacity duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:opacity-90 motion-reduce:transition-none",
            isBannerActive && "ring-2 ring-ring",
          )}
          render={
            <Link
              href={banner.absoluteHref}
              aria-current={isBannerActive ? "page" : undefined}
            />
          }
        >
          {bannerCard}
        </NavigationMenuLink>
      ) : (
        <div className="group relative block h-28 w-full overflow-hidden rounded-md bg-ink select-none">
          {bannerCard}
        </div>
      )}

      {/* Pill-shaped button links */}
      {pillar.links && pillar.links.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {pillar.links.map((link) => {
            const isLinkActive = Boolean(
              link.absoluteHref && pathname === link.absoluteHref,
            );
            const linkKey = `${link.name}-${link.absoluteHref}`;

            return (
              <li key={linkKey}>
                {link.absoluteHref ? (
                  <NavigationMenuLink
                    className={cn(
                      "flex w-full items-center gap-1.5 rounded-md bg-surface-muted px-3 py-1.5 text-left text-sm text-foreground transition-colors duration-150 select-none motion-reduce:transition-none",
                      "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset active:bg-accent/80",
                      isLinkActive &&
                        "bg-accent font-medium text-accent-foreground",
                    )}
                    render={
                      <Link
                        href={link.absoluteHref}
                        aria-current={isLinkActive ? "page" : undefined}
                      />
                    }
                  >
                    <MenuLinkIcon icon={link.icon} />
                    <span>{link.name}</span>
                  </NavigationMenuLink>
                ) : (
                  <div className="flex w-full items-center gap-1.5 rounded-md bg-surface-muted px-3 py-1.5 text-left text-sm text-foreground-muted select-none">
                    <MenuLinkIcon icon={link.icon} />
                    <span>{link.name}</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function PillarBottomBar({
  bottomBar,
  pathname,
}: {
  bottomBar: BottomBarItem;
  pathname: string;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border-subtle pt-2.5 text-left">
      {bottomBar.label && (
        <span className="text-xs font-bold tracking-wider text-foreground uppercase">
          {bottomBar.label}:
        </span>
      )}
      <div className="flex flex-wrap gap-1.5">
        {bottomBar.links.map((link) => {
          const isBottomLinkActive = Boolean(
            link.absoluteHref && pathname === link.absoluteHref,
          );
          const linkKey = `${link.name}-${link.absoluteHref}`;

          return link.absoluteHref ? (
            <NavigationMenuLink
              key={linkKey}
              render={
                <Link
                  href={link.absoluteHref}
                  aria-current={isBottomLinkActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md bg-surface-muted px-2.5 py-1 text-left text-sm text-foreground transition-colors duration-150 select-none motion-reduce:transition-none",
                    "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset active:bg-accent/80",
                    isBottomLinkActive &&
                      "bg-accent font-medium text-accent-foreground",
                  )}
                />
              }
            >
              <MenuLinkIcon icon={link.icon} />
              <span>{link.name}</span>
            </NavigationMenuLink>
          ) : (
            <span
              key={linkKey}
              className="flex items-center gap-1.5 rounded-md bg-surface-muted px-2.5 py-1 text-left text-sm text-foreground-muted select-none"
            >
              <MenuLinkIcon icon={link.icon} />
              <span>{link.name}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function MenuLayoutPillars({
  item,
  pathname,
}: MenuLayoutPillarsProps) {
  if (!item.pillars || item.pillars.length === 0) {
    return null;
  }

  const count = item.pillars.length;
  const containerWidthClass =
    CONTAINER_WIDTH_BY_COUNT[count] ?? DEFAULT_CONTAINER_WIDTH;
  const gridColsClass = GRID_COLS_BY_COUNT[count] ?? DEFAULT_GRID_COLS;

  return (
    <div
      className={cn("max-w-[calc(100vw-2rem)] p-card-sm", containerWidthClass)}
    >
      {/* Pillars Columns Grid */}
      <div className={cn("grid gap-3", gridColsClass)}>
        {item.pillars.map((pillar) => (
          <PillarColumn
            key={`${pillar.headerBanner.title}-${pillar.headerBanner.absoluteHref}`}
            pillar={pillar}
            pathname={pathname}
          />
        ))}
      </div>

      {/* Bottom Footer Bar */}
      {item.bottomBar && item.bottomBar.links.length > 0 && (
        <PillarBottomBar bottomBar={item.bottomBar} pathname={pathname} />
      )}
    </div>
  );
}
