import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { MenuItem } from "@/utils/menu";
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
    <ul className="grid w-[360px] gap-2.5 p-3 sm:w-[480px] md:w-[640px] md:grid-cols-2 lg:w-[860px] lg:grid-cols-3">
      {item.children.map((child, index) => {
        const isActive = pathname === child.absoluteHref;

        return (
          <li key={index} className="flex">
            <NavigationMenuLink
              render={
                <Link
                  href={child.absoluteHref}
                  className={twMerge(
                    "group flex flex-1 flex-col justify-start rounded-lg p-3 text-left transition-colors outline-none select-none",
                    "hover:bg-primary-700/80 focus:bg-primary-700/80",
                    isActive && "bg-primary-700",
                  )}
                />
              }
            >
              <div className="text-sm leading-snug font-semibold text-white group-hover:text-white">
                {child.name}
              </div>

              {child.description && (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-200 group-hover:text-gray-100">
                  {child.description}
                </p>
              )}

              {/* Sub-items if any */}
              {child.children && child.children.length > 0 && (
                <div className="border-primary-500/30 mt-2.5 flex flex-wrap gap-1.5 border-t pt-2">
                  {child.children.map((subChild, subIdx) => (
                    <Link
                      key={subIdx}
                      href={subChild.absoluteHref}
                      className={twMerge(
                        "bg-primary-700/60 hover:bg-primary-800 rounded px-1.5 py-0.5 text-[11px] text-gray-200 transition-colors hover:text-white",
                        pathname === subChild.absoluteHref &&
                          "bg-primary-800 font-medium text-white",
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {subChild.name}
                    </Link>
                  ))}
                </div>
              )}
            </NavigationMenuLink>
          </li>
        );
      })}
    </ul>
  );
}
