import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { cn } from "@/utils/common";
import { MenuItem } from "@/utils/menu";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

interface MenuLayoutPillarsProps {
  item: MenuItem;
  pathname: string;
}

export function MenuLayoutPillars({ item, pathname }: MenuLayoutPillarsProps) {
  if (!item.pillars || item.pillars.length === 0) {
    return null;
  }

  const count = item.pillars.length;

  const containerWidthClass =
    count === 1
      ? "w-[340px] sm:w-[380px]"
      : count === 2
        ? "w-[380px] sm:w-[580px] md:w-[640px]"
        : count === 3
          ? "w-[380px] sm:w-[580px] md:w-[760px] lg:w-[920px]"
          : "w-[380px] sm:w-[580px] md:w-[760px] lg:w-[1020px] xl:w-[1180px]";

  const gridColsClass =
    count === 1
      ? "grid-cols-1"
      : count === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : count === 3
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={twMerge("p-4", containerWidthClass)}>
      {/* Pillars Columns Grid */}
      <div className={twMerge("grid gap-4", gridColsClass)}>
        {item.pillars.map((pillar, pIdx) => {
          const banner = pillar.headerBanner;
          const isBannerActive = banner.absoluteHref
            ? pathname === banner.absoluteHref
            : false;

          const bannerCard = (
            <>
              {banner.image?.url && (
                <Image
                  src={banner.image.url}
                  alt={banner.image.alt || banner.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-2.5">
                <div className="flex items-center justify-between gap-1">
                  <div className="text-base leading-tight font-bold text-white drop-shadow-sm">
                    {banner.title}
                  </div>
                  {banner.absoluteHref && (
                    <ChevronRight className="size-4 shrink-0 text-white/80 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" />
                  )}
                </div>
                {banner.subtitle && (
                  <div className="mt-0.5 line-clamp-1 text-base text-gray-200 drop-shadow-sm">
                    {banner.subtitle}
                  </div>
                )}
              </div>
            </>
          );

          return (
            <div key={pIdx} className="flex flex-col gap-2.5">
              {/* Pillar Banner Card */}
              {banner.absoluteHref ? (
                <NavigationMenuLink
                  render={
                    <Link
                      href={banner.absoluteHref}
                      className={twMerge(
                        "group bg-primary-800 relative block h-28 w-full overflow-hidden rounded-xl shadow-md transition-transform duration-200 hover:scale-[1.02] focus:outline-none",
                        isBannerActive && "ring-2 ring-white/80",
                      )}
                    />
                  }
                >
                  {bannerCard}
                </NavigationMenuLink>
              ) : (
                <div className="group bg-primary-800 relative block h-28 w-full overflow-hidden rounded-xl shadow-md select-none">
                  {bannerCard}
                </div>
              )}

              {/* Pill-shaped button links */}
              {pillar.links && pillar.links.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {pillar.links.map((link, lIdx) => {
                    const isLinkActive = link.absoluteHref
                      ? pathname === link.absoluteHref
                      : false;

                    return (
                      <li key={lIdx}>
                        {link.absoluteHref ? (
                          <NavigationMenuLink
                            render={
                              <Link
                                href={link.absoluteHref}
                                className={cn(
                                  "bg-primary-700/60 block w-full rounded-full px-3.5 py-2 text-left text-base font-medium text-gray-100 transition-all select-none",
                                  "hover:bg-primary-800 focus:bg-primary-800 hover:text-white",
                                  isLinkActive &&
                                    "bg-primary-700 font-semibold text-white",
                                )}
                              />
                            }
                          >
                            {link.name}
                          </NavigationMenuLink>
                        ) : (
                          <div className="bg-primary-700/60 block w-full rounded-full px-3.5 py-2 text-left text-base font-medium text-gray-300 select-none">
                            {link.name}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Footer Bar */}
      {item.bottomBar && item.bottomBar.links.length > 0 && (
        <div className="border-primary-500/30 mt-4 flex flex-wrap items-center gap-2.5 border-t pt-3">
          {item.bottomBar.label && (
            <span className="text-base font-bold tracking-wider text-white uppercase">
              {item.bottomBar.label}:
            </span>
          )}
          <div className="flex flex-wrap gap-2">
            {item.bottomBar.links.map((link, bIdx) => {
              const isBottomLinkActive = link.absoluteHref
                ? pathname === link.absoluteHref
                : false;

              return link.absoluteHref ? (
                <NavigationMenuLink
                  key={bIdx}
                  render={
                    <Link
                      href={link.absoluteHref}
                      className={twMerge(
                        "border-primary-500/40 bg-primary-700/60 rounded-full border px-3.5 py-1.5 text-base font-medium text-gray-100 transition-colors select-none",
                        "hover:bg-primary-700 focus:bg-primary-700 hover:text-white",
                        isBottomLinkActive &&
                          "bg-primary-800 border-white/60 font-semibold text-white",
                      )}
                    />
                  }
                >
                  {link.name}
                </NavigationMenuLink>
              ) : (
                <span
                  key={bIdx}
                  className="border-primary-500/40 bg-primary-700/40 rounded-full border px-3.5 py-1.5 text-base font-medium text-gray-300 select-none"
                >
                  {link.name}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
