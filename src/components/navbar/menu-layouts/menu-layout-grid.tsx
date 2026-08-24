import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { MenuItem } from "@/utils/menu";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

interface MenuLayoutGridProps {
  item: MenuItem;
  pathname: string;
}

export function MenuLayoutGrid({ item, pathname }: MenuLayoutGridProps) {
  if (!item.children || item.children.length === 0) {
    return null;
  }

  return (
    <ul className="grid w-[400px] gap-3 p-3.5 sm:w-[540px] md:w-[720px] md:grid-cols-2 lg:w-[960px] lg:grid-cols-3">
      {item.children.map((child, index) => {
        const isActive = child.absoluteHref
          ? pathname === child.absoluteHref
          : false;

        const headerContent = (
          <div className="flex w-full items-center justify-between gap-x-2">
            <div>
              <div className="flex w-full items-center justify-between gap-2 text-left">
                {child.icon?.url && (
                  <span className="relative inline-block size-5 shrink-0">
                    <Image
                      src={child.icon.url}
                      alt={child.icon.alt || child.name}
                      fill
                      className="object-contain"
                    />
                  </span>
                )}
                <span className="text-left text-lg leading-snug font-bold text-white group-hover:text-white">
                  {child.name}
                </span>
              </div>

              {child.description && (
                <p className="mt-1 line-clamp-2 w-full text-left text-sm leading-relaxed text-gray-100 group-hover:text-white">
                  {child.description}
                </p>
              )}
            </div>

            {child.absoluteHref && (
              <ChevronRight className="size-4 shrink-0 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-white" />
            )}
          </div>
        );

        return (
          <li key={index} className="flex flex-col justify-start">
            {/* Parent Header Link */}
            {child.absoluteHref ? (
              <NavigationMenuLink
                className="w-full items-start justify-start p-0 text-left"
                render={
                  <Link
                    href={child.absoluteHref}
                    className={twMerge(
                      "group flex w-full items-center justify-between gap-x-2 rounded-md p-3.5 text-left transition-colors outline-none select-none",
                      "hover:bg-primary-800 focus:bg-primary-800",
                      isActive && "bg-primary-700",
                    )}
                  />
                }
              >
                {headerContent}
              </NavigationMenuLink>
            ) : (
              <div className="group flex w-full items-center justify-between gap-x-2 rounded-md p-3.5 text-left select-none">
                {headerContent}
              </div>
            )}

            {/* Sub-items if any */}
            {child.children && child.children.length > 0 && (
              <div className="border-primary-500/30 mt-1.5 flex w-full flex-wrap justify-start gap-1.5 border-t px-2 pt-2.5 text-left">
                {child.children.map((subChild, subIdx) =>
                  subChild.absoluteHref ? (
                    <Link
                      key={subIdx}
                      href={subChild.absoluteHref}
                      className={twMerge(
                        "bg-primary-700/60 hover:bg-primary-800 rounded-md px-2 py-0.5 text-left text-base text-gray-200 transition-colors hover:text-white",
                        pathname === subChild.absoluteHref &&
                          "bg-primary-700 font-medium text-white",
                      )}
                    >
                      {subChild.name}
                    </Link>
                  ) : (
                    <span
                      key={subIdx}
                      className="bg-primary-700/60 rounded-md px-2 py-0.5 text-left text-base text-gray-300"
                    >
                      {subChild.name}
                    </span>
                  ),
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
