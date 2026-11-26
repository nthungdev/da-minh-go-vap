import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { getMenuIconSrc } from "@/definitions/menu-icons";
import { cn } from "@/utils/common";
import type { MenuItem } from "@/utils/menu";

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
    <ul className="grid w-[400px] max-w-[calc(100vw-2rem)] gap-3 p-card-sm sm:w-[540px] md:w-[720px] md:grid-cols-2 lg:w-[960px] lg:grid-cols-3">
      {item.children.map((child) => {
        const childKey = `${child.name}-${child.absoluteHref}`;
        const isActive = child.absoluteHref
          ? pathname === child.absoluteHref
          : false;

        const headerContent = (
          <div className="flex w-full items-center gap-x-2.5">
            {child.icon && (
              <span className="relative inline-block size-9 shrink-0 overflow-hidden">
                <Image
                  unoptimized
                  src={getMenuIconSrc(child.icon)}
                  alt=""
                  aria-hidden="true"
                  sizes="36px"
                  fill
                  className="object-contain"
                />
              </span>
            )}
            <div className="flex flex-1 shrink-0 items-center justify-between gap-x-2">
              <div className="flex-1">
                <div className="flex w-full items-center justify-between gap-2 text-left">
                  <span
                    className={cn(
                      "text-left text-base leading-snug font-bold text-foreground transition-colors duration-150 group-hover:text-primary motion-reduce:transition-none sm:text-lg",
                      isActive && "text-accent-foreground",
                    )}
                  >
                    {child.name}
                  </span>
                </div>

                {child.description && (
                  <p className="mt-1 line-clamp-2 w-full text-left text-sm leading-relaxed text-foreground-muted">
                    {child.description}
                  </p>
                )}
              </div>

              {child.absoluteHref && (
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-foreground-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-primary motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                />
              )}
            </div>
          </div>
        );

        return (
          <li key={childKey} className="flex flex-col justify-start">
            {/* Parent Header Link */}
            {child.absoluteHref ? (
              <NavigationMenuLink
                className="w-full items-start justify-start p-0 text-left"
                render={
                  <Link
                    href={child.absoluteHref}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "group flex w-full items-center justify-between gap-x-2 rounded-md p-2.5 text-left transition-colors duration-150 outline-none select-none motion-reduce:transition-none",
                      "hover:bg-surface-muted focus:bg-surface-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset active:bg-accent/80",
                      isActive && "bg-accent text-accent-foreground",
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
              <div className="mt-1.5 flex w-full flex-wrap justify-start gap-1.5 border-t border-border-subtle pt-2.5 text-left">
                {child.children.map((subChild) => {
                  const subChildKey = `${subChild.name}-${subChild.absoluteHref}`;
                  const isSubActive = Boolean(
                    subChild.absoluteHref && pathname === subChild.absoluteHref,
                  );
                  return subChild.absoluteHref ? (
                    <NavigationMenuLink
                      key={subChildKey}
                      render={
                        <Link
                          href={subChild.absoluteHref}
                          aria-current={isSubActive ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-1.5 rounded-md bg-surface-muted px-2.5 py-1 text-left text-sm text-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset active:bg-accent/80 motion-reduce:transition-none",
                            isSubActive &&
                              "bg-accent font-medium text-accent-foreground",
                          )}
                        />
                      }
                    >
                      {subChild.icon && (
                        <span className="relative inline-block size-4 shrink-0 overflow-hidden rounded-pill bg-surface">
                          <Image
                            unoptimized
                            src={getMenuIconSrc(subChild.icon)}
                            alt=""
                            aria-hidden="true"
                            sizes="16px"
                            fill
                            className="rounded-pill object-contain"
                          />
                        </span>
                      )}
                      <span>{subChild.name}</span>
                    </NavigationMenuLink>
                  ) : (
                    <span
                      key={subChildKey}
                      className="flex items-center gap-1.5 rounded-md bg-surface-muted px-2.5 py-1 text-left text-sm text-foreground-muted"
                    >
                      {subChild.icon && (
                        <span className="relative inline-block size-4 shrink-0 overflow-hidden rounded-pill bg-surface">
                          <Image
                            unoptimized
                            src={getMenuIconSrc(subChild.icon)}
                            alt=""
                            aria-hidden="true"
                            sizes="16px"
                            fill
                            className="rounded-pill object-contain"
                          />
                        </span>
                      )}
                      <span>{subChild.name}</span>
                    </span>
                  );
                })}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
