"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { getMenuIconSrc } from "@/definitions/menu-icons";
import type { Media } from "@/payload-types";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";
import type { MenuIconType, MenuItem } from "@/utils/menu";
import type { MenuCategoryPosts } from "@/utils/menu-category-posts";
import type { SearchTagOption } from "@/utils/search";
import AppPostSearchButton from "./app-post-search-button";
import LocaleSwitcher from "./locale-switcher";
import MenuLayoutRenderer from "./navbar/menu-layouts/menu-layout-renderer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

export interface MenuIconProps {
  icon?: string | null;
  decorative?: boolean;
  name?: string | null;
  size?: number | "sm" | "md";
  className?: string;
}

/**
 * Renders an optimized menu icon badge for navigation items.
 *
 * @param icon - Menu icon identifier.
 * @param decorative - Whether nearby text supplies the accessible label.
 * @param name - Accessible label / alt text for the icon.
 * @param size - Icon display size (4 / "sm" for small, 5 / "md" for default).
 * @param className - Additional Tailwind CSS classes.
 */
export function MenuIcon({
  icon,
  name,
  decorative = false,
  size = 5,
  className,
}: MenuIconProps) {
  if (!icon) return null;

  const src = getMenuIconSrc(icon);
  if (!src) return null;

  const sizeClass = size === 4 || size === "sm" ? "size-4" : "size-5";
  const imageSizes = size === 4 || size === "sm" ? "16px" : "20px";

  return (
    <span
      className={cn(
        "relative inline-block shrink-0 overflow-hidden rounded-pill bg-surface",
        sizeClass,
        className,
      )}
    >
      <Image
        unoptimized
        src={src}
        alt={decorative ? "" : name || icon}
        aria-hidden={decorative || undefined}
        fill
        sizes={imageSizes}
        className="rounded-pill object-contain"
      />
    </span>
  );
}

function hasSubContent(item: MenuItem): boolean {
  if (item.layout === "pillars") return Boolean(item.pillars?.length);
  if (item.layout === "tabs-posts") return Boolean(item.categories?.length);
  return Boolean(item.children?.length);
}

function getMenuItemKey(item: MenuItem): string {
  return `${item.name}-${item.absoluteHref}-${item.icon ?? ""}`;
}

function DesktopNavItem({
  item,
  pathname,
  categoryPostsPromise,
}: {
  item: MenuItem;
  pathname: string;
  categoryPostsPromise: Promise<MenuCategoryPosts>;
}) {
  const label = item.name ? <span>{item.name.toUpperCase()}</span> : null;

  const isRouteActive = Boolean(
    item.absoluteHref && pathname === item.absoluteHref,
  );

  if (hasSubContent(item)) {
    return (
      <NavigationMenuItem>
        <NavigationMenuTrigger
          render={
            item.absoluteHref ? (
              <Link
                href={item.absoluteHref}
                aria-current={isRouteActive ? "page" : undefined}
              />
            ) : undefined
          }
          nativeButton={!item.absoluteHref}
          aria-label={item.name || item.icon || "Menu"}
          className={cn(
            "flex items-center gap-1.5 text-primary-foreground transition-colors duration-150 hover:bg-surface hover:text-primary focus:bg-surface focus:text-primary focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-1 focus-visible:ring-offset-primary focus-visible:outline-none active:bg-surface/90 active:text-primary data-popup-open:bg-surface data-popup-open:text-primary data-[state=open]:bg-surface data-[state=open]:text-primary motion-reduce:transition-none data-open:bg-surface data-open:text-primary",
            isRouteActive && "bg-surface font-bold text-primary",
          )}
        >
          <MenuIcon
            icon={item.icon}
            name={item.name}
            decorative={Boolean(item.name)}
            size={5}
          />
          {label}
        </NavigationMenuTrigger>
        <NavigationMenuContent className="rounded-xl border-none bg-surface-elevated text-foreground shadow-lg">
          <MenuLayoutRenderer
            item={item}
            pathname={pathname}
            categoryPostsPromise={categoryPostsPromise}
          />
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  if (item.absoluteHref) {
    return (
      <NavigationMenuItem>
        <NavigationMenuLink
          className={cn(
            navigationMenuTriggerStyle(),
            "flex items-center gap-1.5 text-primary-foreground transition-colors duration-150 hover:bg-surface hover:text-primary focus:bg-surface focus:text-primary focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-1 focus-visible:ring-offset-primary focus-visible:outline-none active:bg-surface/90 active:text-primary motion-reduce:transition-none",
            isRouteActive && "bg-surface font-bold text-primary",
          )}
          render={
            <Link
              href={item.absoluteHref}
              aria-current={isRouteActive ? "page" : undefined}
              aria-label={item.name || item.icon || "Link"}
            />
          }
        >
          <MenuIcon
            icon={item.icon}
            name={item.name}
            decorative={Boolean(item.name)}
            size={5}
          />
          {label}
        </NavigationMenuLink>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem>
      <span
        className={cn(
          navigationMenuTriggerStyle(),
          "flex cursor-default items-center gap-1.5 bg-transparent text-primary-foreground select-none",
        )}
      >
        <MenuIcon
          icon={item.icon}
          name={item.name}
          decorative={Boolean(item.name)}
          size={5}
        />
        {label}
      </span>
    </NavigationMenuItem>
  );
}

function MobileSubLink({
  name,
  href,
  icon,
  iconSize,
  pathname,
  onNavigate,
  linkClassName,
  staticClassName,
}: {
  name: string;
  href?: string;
  icon?: MenuIconType;
  iconSize: number;
  pathname: string;
  onNavigate: () => void;
  linkClassName: string;
  staticClassName: string;
}) {
  if (href) {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        onClick={onNavigate}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "rounded-md duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none active:bg-accent/80 active:text-accent-foreground motion-reduce:transition-none",
          linkClassName,
          isActive && "font-semibold text-primary",
        )}
      >
        <MenuIcon
          icon={icon}
          name={name}
          decorative={Boolean(name)}
          size={iconSize}
        />
        <span>{name}</span>
      </Link>
    );
  }

  return (
    <span className={staticClassName}>
      <MenuIcon
        icon={icon}
        name={name}
        decorative={Boolean(name)}
        size={iconSize}
      />
      <span>{name}</span>
    </span>
  );
}

function MobileSubContent({
  item,
  pathname,
  onNavigate,
}: {
  item: MenuItem;
  pathname: string;
  onNavigate: () => void;
}) {
  if (item.layout === "grid") {
    return (
      <>
        {item.children?.map((child) => {
          const hasNestedChildren = Boolean(
            child.children && child.children.length > 0,
          );

          return (
            <li key={`${child.name}-${child.absoluteHref}`}>
              <MobileSubLink
                name={child.name}
                href={child.absoluteHref}
                icon={child.icon}
                iconSize={5}
                pathname={pathname}
                onNavigate={onNavigate}
                linkClassName={cn(
                  "flex items-center gap-2 px-2 py-2 text-base text-foreground transition-colors hover:bg-surface-muted hover:text-primary",
                  hasNestedChildren && "font-semibold",
                )}
                staticClassName={cn(
                  "flex items-center gap-2 px-2 py-2 text-base font-medium text-foreground-muted",
                  hasNestedChildren && "font-semibold text-foreground",
                )}
              />
              {hasNestedChildren && (
                <ul className="mt-1 flex flex-col gap-1 border-l-2 border-border-subtle pl-4">
                  {child.children?.map((subChild) => (
                    <li key={`${subChild.name}-${subChild.absoluteHref}`}>
                      <MobileSubLink
                        name={subChild.name}
                        href={subChild.absoluteHref}
                        icon={subChild.icon}
                        iconSize={4}
                        pathname={pathname}
                        onNavigate={onNavigate}
                        linkClassName="flex items-center gap-2 px-2 py-1.5 text-base text-foreground transition-colors hover:bg-surface-muted hover:text-primary"
                        staticClassName="flex items-center gap-2 px-2 py-1.5 text-base text-foreground-muted"
                      />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </>
    );
  }

  if (item.layout === "pillars") {
    return (
      <>
        {item.pillars?.map((pillar) => (
          <li
            key={`${pillar.headerBanner.title}-${pillar.headerBanner.absoluteHref}`}
            className="space-y-1 py-1"
          >
            {pillar.headerBanner.absoluteHref ? (
              <Link
                href={pillar.headerBanner.absoluteHref}
                onClick={onNavigate}
                aria-current={
                  pathname === pillar.headerBanner.absoluteHref
                    ? "page"
                    : undefined
                }
                className={cn(
                  "block rounded-md px-2 py-1 text-base font-bold uppercase transition-colors duration-150 hover:bg-surface-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none active:bg-accent/80 active:text-accent-foreground motion-reduce:transition-none",
                  pathname === pillar.headerBanner.absoluteHref
                    ? "text-primary"
                    : "text-foreground",
                )}
              >
                {pillar.headerBanner.title}
              </Link>
            ) : (
              <span className="block px-2 py-1 text-base font-bold text-foreground uppercase">
                {pillar.headerBanner.title}
              </span>
            )}
            {pillar.links.map((link) => (
              <div key={`${link.name}-${link.absoluteHref}`}>
                <MobileSubLink
                  name={link.name}
                  href={link.absoluteHref}
                  icon={link.icon}
                  iconSize={4}
                  pathname={pathname}
                  onNavigate={onNavigate}
                  linkClassName="flex items-center gap-2 px-2 py-1.5 text-base text-foreground transition-colors hover:bg-surface-muted hover:text-primary"
                  staticClassName="flex items-center gap-2 px-2 py-1.5 text-base text-foreground-muted"
                />
              </div>
            ))}
          </li>
        ))}
        {item.bottomBar?.links.map((link) => (
          <li key={`bottom-${link.name}-${link.absoluteHref}`}>
            <MobileSubLink
              name={link.name}
              href={link.absoluteHref}
              icon={link.icon}
              iconSize={4}
              pathname={pathname}
              onNavigate={onNavigate}
              linkClassName="flex items-center gap-2 px-2 py-1.5 text-base font-medium text-foreground transition-colors hover:bg-surface-muted hover:text-primary"
              staticClassName="flex items-center gap-2 px-2 py-1.5 text-base font-medium text-foreground-muted"
            />
          </li>
        ))}
      </>
    );
  }

  if (item.layout === "tabs-posts") {
    return (
      <>
        {item.categories?.map((cat) => (
          <li key={`${cat.name}-${cat.absoluteHref}`}>
            <MobileSubLink
              name={cat.name}
              href={cat.absoluteHref}
              icon={cat.icon}
              iconSize={4}
              pathname={pathname}
              onNavigate={onNavigate}
              linkClassName="flex items-center gap-2 px-2 py-2 text-base text-foreground transition-colors hover:bg-surface-muted hover:text-primary"
              staticClassName="flex items-center gap-2 px-2 py-2 text-base font-medium text-foreground-muted"
            />
          </li>
        ))}
      </>
    );
  }

  return null;
}

function MobileNavLabel({
  item,
  pathname,
  onNavigate,
  className,
  fallbackAriaLabel,
}: {
  item: MenuItem;
  pathname: string;
  onNavigate: () => void;
  className?: string;
  fallbackAriaLabel: string;
}) {
  const content = (
    <>
      <MenuIcon
        icon={item.icon}
        name={item.name}
        decorative={Boolean(item.name)}
        size={5}
      />
      {item.name ? <span>{item.name}</span> : null}
    </>
  );

  if (item.absoluteHref) {
    const isActive = pathname === item.absoluteHref;
    return (
      <Link
        href={item.absoluteHref}
        onClick={onNavigate}
        aria-current={isActive ? "page" : undefined}
        aria-label={item.name || item.icon || fallbackAriaLabel}
        className={cn(
          "flex min-h-11 items-center gap-2 rounded-md px-2 py-2.5 text-base font-medium text-foreground transition-colors duration-150 hover:bg-surface-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none active:bg-accent/80 active:text-accent-foreground motion-reduce:transition-none",
          className,
          isActive && "bg-accent font-semibold text-accent-foreground",
        )}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-11 items-center gap-2 px-2 py-2.5 text-base font-medium text-foreground",
        className,
      )}
    >
      {content}
    </div>
  );
}

function MobileNavItem({
  item,
  itemKey,
  pathname,
  onNavigate,
}: {
  item: MenuItem;
  itemKey: string;
  pathname: string;
  onNavigate: () => void;
}) {
  const t = useTranslations("navigation");

  if (hasSubContent(item)) {
    return (
      <div className="border-b border-border-subtle last:border-0">
        <AccordionItem value={itemKey} className="border-none">
          <div className="flex items-center justify-between gap-1">
            <MobileNavLabel
              item={item}
              pathname={pathname}
              onNavigate={onNavigate}
              className="flex-1"
              fallbackAriaLabel="Menu"
            />
            <AccordionTrigger
              aria-label={t("toggleSection", {
                name: item.name || item.icon || "",
              })}
              className="min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md p-2 text-foreground-muted transition-colors duration-150 hover:bg-surface-muted hover:text-primary hover:no-underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none active:bg-accent/80 **:data-[slot=accordion-trigger-icon]:ml-0 motion-reduce:transition-none"
            />
          </div>
          <AccordionContent className="pb-3 pl-4">
            <ul className="flex flex-col gap-1 border-l-2 border-border-subtle pl-3">
              <MobileSubContent
                item={item}
                pathname={pathname}
                onNavigate={onNavigate}
              />
            </ul>
          </AccordionContent>
        </AccordionItem>
      </div>
    );
  }

  return (
    <div className="border-b border-border-subtle last:border-0">
      <MobileNavLabel
        item={item}
        pathname={pathname}
        onNavigate={onNavigate}
        className={item.absoluteHref ? undefined : "select-none"}
        fallbackAriaLabel="Link"
      />
    </div>
  );
}

interface TheNavbarClientProps {
  menu: MenuItem[];
  logo?: Media | null;
  /** Pending mega-menu posts; resolved inside a Suspense boundary. */
  categoryPostsPromise: Promise<MenuCategoryPosts>;
  searchTags?: SearchTagOption[];
}

export default function TheNavbarClient({
  menu,
  logo,
  categoryPostsPromise,
  searchTags = [],
}: TheNavbarClientProps) {
  const t = useTranslations("navigation");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <div className="flex min-w-0 items-center justify-center lg:space-x-8">
        {/* Brand & Logo (Desktop & Mobile) */}
        <Link
          href="/"
          className="relative z-20 flex min-w-0 shrink-0 items-center rounded-md transition-opacity duration-150 hover:opacity-95 focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary focus-visible:outline-none active:opacity-85 motion-reduce:transition-none"
        >
          {/* Mobile Text Brand */}
          <div className="flex min-w-0 items-center gap-2 font-semibold lg:hidden">
            {typeof logo?.url === "string" ? (
              <div className="relative h-10 w-10 shrink-0">
                <Image
                  src={transformUrl(logo.url)}
                  alt={logo.alt || "Logo"}
                  sizes="40px"
                  fill
                  className="object-contain"
                />
              </div>
            ) : null}
            <span className="text-sm leading-tight font-bold sm:text-base">
              {t("brandLine1")}
              <br />
              {t("brandLine2")}
            </span>
          </div>

          {/* Desktop Logo (overlapping design) */}
          {typeof logo?.url === "string" && (
            <div className="relative z-20 hidden h-16 w-20 self-start lg:block">
              <div className="absolute top-[20%] left-0 size-20 overflow-hidden">
                <Image
                  src={transformUrl(logo.url)}
                  alt={logo.alt || "Logo"}
                  sizes="80px"
                  fill
                />
              </div>
            </div>
          )}
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden flex-1 items-center lg:flex">
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              {menu.map((item) => (
                <DesktopNavItem
                  key={getMenuItemKey(item)}
                  item={item}
                  pathname={pathname}
                  categoryPostsPromise={categoryPostsPromise}
                />
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right Actions (Desktop) */}
        <div className="hidden items-center space-x-2 lg:flex">
          <div className="p-1 text-primary-foreground">
            <AppPostSearchButton
              id="desktop-navbar-search"
              searchTags={searchTags}
            />
          </div>
          <LocaleSwitcher />
        </div>
      </div>

      {/* Right Actions & Mobile Toggle (Mobile) */}
      <div className="flex shrink-0 items-center gap-1 text-primary-foreground sm:gap-1.5 lg:hidden">
        <AppPostSearchButton
          id="mobile-navbar-search"
          searchTags={searchTags}
        />
        <LocaleSwitcher />
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger className="-mr-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-primary-foreground transition-colors duration-150 hover:cursor-pointer hover:bg-primary-foreground/15 hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-1 focus-visible:ring-offset-primary focus-visible:outline-none active:bg-primary-foreground/25 motion-reduce:transition-none">
            <Menu className="h-6 w-6" aria-hidden="true" />
            <span className="sr-only">{t("toggleMenu")}</span>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[min(300px,85vw)] overflow-y-auto border-r border-border bg-surface text-foreground sm:w-[350px]"
          >
            <SheetHeader className="mb-4 border-b border-border pb-4 text-left">
              <SheetTitle>
                <Link
                  href="/"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-md transition-opacity duration-150 hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:opacity-75 motion-reduce:transition-none"
                >
                  {typeof logo?.url === "string" ? (
                    <div className="relative h-12 w-12 shrink-0">
                      <Image
                        src={transformUrl(logo.url)}
                        alt={logo.alt || "Logo"}
                        sizes="48px"
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : null}
                  <span className="text-lg leading-tight font-bold text-foreground">
                    {t("brandLine1")}
                    <br />
                    {t("brandLine2")}
                  </span>
                </Link>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4 pb-6">
              <Accordion className="w-full">
                {menu.map((item) => {
                  const itemKey = getMenuItemKey(item);
                  return (
                    <MobileNavItem
                      key={itemKey}
                      item={item}
                      itemKey={itemKey}
                      pathname={pathname}
                      onNavigate={closeMobileMenu}
                    />
                  );
                })}
              </Accordion>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
