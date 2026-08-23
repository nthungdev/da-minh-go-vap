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

        const content = (
          <>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-base leading-snug font-semibold text-white group-hover:text-white">
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
                <span>{child.name}</span>
              </div>
              {child.absoluteHref && (
                <ChevronRight className="size-4 shrink-0 text-gray-300 opacity-50 transition-all group-hover:translate-x-0.5 group-hover:text-white group-hover:opacity-100" />
              )}
            </div>

            {child.description && (
              <p className="mt-1 line-clamp-2 text-base leading-relaxed text-gray-100 group-hover:text-white">
                {child.description}
              </p>
            )}

            {/* Sub-items if any */}
            {child.children && child.children.length > 0 && (
              <div className="border-primary-500/30 mt-3 flex flex-wrap gap-1.5 border-t pt-2.5">
                {child.children.map((subChild, subIdx) =>
                  subChild.absoluteHref ? (
                    <Link
                      key={subIdx}
                      href={subChild.absoluteHref}
                      className={twMerge(
                        "bg-primary-700/60 hover:bg-primary-800 rounded-md px-2 py-0.5 text-base text-gray-200 transition-colors hover:text-white",
                        pathname === subChild.absoluteHref &&
                          "bg-primary-800 font-medium text-white",
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {subChild.name}
                    </Link>
                  ) : (
                    <span
                      key={subIdx}
                      className="bg-primary-700/60 rounded-md px-2 py-0.5 text-base text-gray-300"
                    >
                      {subChild.name}
                    </span>
                  ),
                )}
              </div>
            )}
          </>
        );

        return (
          <li key={index} className="flex">
            {child.absoluteHref ? (
              <NavigationMenuLink
                render={
                  <Link
                    href={child.absoluteHref}
                    className={twMerge(
                      "group flex flex-1 flex-col justify-start rounded-lg p-3.5 text-left transition-colors outline-none select-none",
                      "hover:bg-primary-700/80 focus:bg-primary-700/80",
                      isActive && "bg-primary-700",
                    )}
                  />
                }
              >
                {content}
              </NavigationMenuLink>
            ) : (
              <div className="group flex flex-1 flex-col justify-start rounded-lg p-3.5 text-left select-none">
                {content}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
