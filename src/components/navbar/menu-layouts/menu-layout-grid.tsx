import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { cn } from "@/utils/common";
import { MenuItem } from "@/utils/menu";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface MenuLayoutGridProps {
  item: MenuItem;
  pathname: string;
}

export default function MenuLayoutGrid({
  item,
  pathname,
}: MenuLayoutGridProps) {
  if (!item.children || item.children.length === 0) {
    return null;
  }

  return (
    <ul className="grid w-[400px] gap-2 p-2 sm:w-[540px] md:w-[720px] md:grid-cols-2 lg:w-[960px] lg:grid-cols-3">
      {item.children.map((child, index) => {
        const isActive = child.absoluteHref
          ? pathname === child.absoluteHref
          : false;

        const headerContent = (
          <div className="flex w-full items-center gap-x-2">
            {child.icon?.url && (
              <span className="relative inline-block size-10 shrink-0 overflow-hidden rounded-md">
                <Image
                  src={child.icon.url}
                  alt={child.icon.alt || child.name}
                  fill
                  className="object-contain"
                />
              </span>
            )}
            <div className="flex flex-1 shrink-0 items-center justify-between gap-x-2">
              <div className="flex-1">
                <div className="flex w-full items-center justify-between gap-2 text-left">
                  <span className="group-hover:text-primary-700 text-left text-lg leading-snug font-bold text-gray-900">
                    {child.name}
                  </span>
                </div>

                {child.description && (
                  <p className="mt-1 line-clamp-2 w-full text-left text-sm leading-relaxed text-gray-600">
                    {child.description}
                  </p>
                )}
              </div>

              {child.absoluteHref && (
                <ChevronRight className="group-hover:text-primary-600 size-4 shrink-0 text-gray-400 transition-all group-hover:translate-x-0.5" />
              )}
            </div>
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
                    className={cn(
                      "group flex w-full items-center justify-between gap-x-2 rounded-md p-2.5 text-left transition-colors outline-none select-none",
                      "hover:bg-gray-100 focus:bg-gray-100",
                      isActive && "text-primary-700 bg-gray-100",
                    )}
                  />
                }
              >
                {headerContent}
              </NavigationMenuLink>
            ) : (
              <div className="group flex w-full items-center justify-between gap-x-2 rounded-md p-2.5 text-left select-none">
                {headerContent}
              </div>
            )}

            {/* Sub-items if any */}
            {child.children && child.children.length > 0 && (
              <div className="mt-1.5 flex w-full flex-wrap justify-start gap-1.5 border-t border-gray-100 pt-2.5 text-left">
                {child.children.map((subChild, subIdx) =>
                  subChild.absoluteHref ? (
                    <Link
                      key={subIdx}
                      href={subChild.absoluteHref}
                      className={cn(
                        "rounded-md bg-gray-100 px-2 py-0.5 text-left text-base text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-900",
                        pathname === subChild.absoluteHref &&
                          "bg-primary-50 text-primary-700 font-medium",
                      )}
                    >
                      {subChild.name}
                    </Link>
                  ) : (
                    <span
                      key={subIdx}
                      className="rounded-md bg-gray-100 px-2 py-0.5 text-left text-base text-gray-600"
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
