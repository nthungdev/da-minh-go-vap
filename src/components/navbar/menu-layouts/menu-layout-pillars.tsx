import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { cn } from "@/utils/common";
import { MenuItem } from "@/utils/menu";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface MenuLayoutPillarsProps {
  item: MenuItem;
  pathname: string;
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
    <div className={cn("p-2", containerWidthClass)}>
      {/* Pillars Columns Grid */}
      <div className={cn("grid gap-2", gridColsClass)}>
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-2.5">
                <div className="flex items-center justify-between gap-1">
                  <div className="text-base leading-tight font-bold text-white">
                    {banner.title}
                  </div>
                  {banner.absoluteHref && (
                    <ChevronRight className="size-4 shrink-0 text-white/75 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
                  )}
                </div>
                {banner.subtitle && (
                  <div className="mt-0.5 line-clamp-1 text-sm text-gray-200">
                    {banner.subtitle}
                  </div>
                )}
              </div>
            </>
          );

          return (
            <div key={pIdx} className="flex flex-col gap-2">
              {/* Pillar Banner Card */}
              {banner.absoluteHref ? (
                <NavigationMenuLink
                  render={
                    <Link
                      href={banner.absoluteHref}
                      className={cn(
                        "group relative block h-28 w-full overflow-hidden rounded-md bg-gray-900 transition-colors focus:outline-none",
                        isBannerActive && "ring-primary-600 ring-2",
                      )}
                    />
                  }
                >
                  {bannerCard}
                </NavigationMenuLink>
              ) : (
                <div className="group relative block h-28 w-full overflow-hidden rounded-md bg-gray-900 select-none">
                  {bannerCard}
                </div>
              )}

              {/* Pill-shaped button links */}
              {pillar.links && pillar.links.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                  {pillar.links.map((link, lIdx) => {
                    const isLinkActive = link.absoluteHref
                      ? pathname === link.absoluteHref
                      : false;

                    return (
                      <li key={lIdx}>
                        {link.absoluteHref ? (
                          <NavigationMenuLink
                            className={cn(
                              "block w-full rounded-md bg-gray-100 px-3 py-1.5 text-left text-base text-gray-700 transition-colors select-none",
                              "hover:bg-primary-50 hover:text-primary-700 focus:bg-primary-50 focus:text-primary-700",
                              isLinkActive &&
                                "bg-primary-50 text-primary-700 font-medium",
                            )}
                            render={<Link href={link.absoluteHref} />}
                          >
                            {link.name}
                          </NavigationMenuLink>
                        ) : (
                          <div className="block w-full rounded-md bg-gray-100 px-3 py-1.5 text-left text-base text-gray-600 select-none">
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
        <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-2 text-left">
          {item.bottomBar.label && (
            <span className="text-sm font-bold tracking-wider text-gray-900 uppercase">
              {item.bottomBar.label}:
            </span>
          )}
          <div className="flex flex-wrap gap-1.5">
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
                      className={cn(
                        "rounded-md bg-gray-100 px-2.5 py-1 text-left text-base text-gray-700 transition-colors select-none",
                        "hover:bg-primary-50 hover:text-primary-700 focus:bg-primary-50 focus:text-primary-700",
                        isBottomLinkActive &&
                          "bg-primary-50 text-primary-700 font-medium",
                      )}
                    />
                  }
                >
                  {link.name}
                </NavigationMenuLink>
              ) : (
                <span
                  key={bIdx}
                  className="rounded-md bg-gray-100 px-2.5 py-1 text-left text-base text-gray-600 select-none"
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
