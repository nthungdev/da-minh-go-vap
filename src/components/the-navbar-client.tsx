"use client";

import { MenuItem } from "@/utils/menu";
import type { Media } from "@/payload-types";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import AppPostSearchButton from "./app-post-search-button";
import LocaleSwitcher from "./locale-switcher";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import MenuLayoutRenderer from "./navbar/menu-layouts/menu-layout-renderer";
import { cn } from "@/utils/common";

interface TheNavbarClientProps {
  menu: MenuItem[];
  logo?: Media | null;
}

export default function TheNavbarClient({ menu, logo }: TheNavbarClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const hasSubContent = (item: MenuItem) => {
    if (item.layout === "pillars") return !!item.pillars?.length;
    if (item.layout === "tabs-posts") return !!item.categories?.length;
    return !!item.children?.length;
  };

  return (
    <>
      <div className="flex flex-1 items-center justify-between lg:justify-start lg:space-x-8">
        {/* Brand & Logo (Desktop & Mobile) */}
        <Link href="/" className="relative z-20 flex shrink-0 items-center">
          {/* Mobile Text Brand */}
          <div className="flex items-center gap-2 font-semibold lg:hidden">
            {typeof logo?.url === "string" ? (
              <div className="relative h-10 w-10">
                <Image
                  src={logo.url}
                  alt={logo.alt || "Logo"}
                  fill
                  className="object-contain"
                />
              </div>
            ) : null}
            <span className="text-base leading-tight font-bold">
              Hội Dòng
              <br />
              Đa Minh Gò Vấp
            </span>
          </div>

          {/* Desktop Logo (overlapping design) */}
          <div className="relative z-20 hidden h-16 w-20 self-start lg:block">
            <div className="absolute top-[20%] left-0 size-20 overflow-auto">
              {typeof logo?.url === "string" && (
                <Image
                  src={logo.url}
                  alt={logo.alt || "Logo"}
                  quality={100}
                  sizes="100%"
                  fill
                  priority
                />
              )}
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden flex-1 items-center lg:flex">
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              {menu.map((item, index) => {
                const hasContent = hasSubContent(item);

                return (
                  <NavigationMenuItem key={index}>
                    {hasContent ? (
                      <>
                        <NavigationMenuTrigger
                          render={
                            item.absoluteHref ? (
                              <Link href={item.absoluteHref} />
                            ) : undefined
                          }
                          aria-label={item.name || item.icon || "Menu"}
                          className="hover:text-primary-700 data-[state=open]:text-primary-700 focus:text-primary-700 data-open:text-primary-700 data-popup-open:text-primary-700 flex items-center gap-1.5 transition-colors hover:bg-white focus:bg-white data-open:bg-white data-popup-open:bg-white data-[state=open]:bg-white"
                        >
                          {item.icon && (
                            <span className="relative inline-block size-5 shrink-0 overflow-hidden rounded-full bg-white">
                              <Image
                                unoptimized
                                src={`/svgs/menu-icons/${item.icon}.svg`}
                                alt={item.name || item.icon}
                                fill
                                className="rounded-full object-contain"
                              />
                            </span>
                          )}
                          {item.name ? (
                            <span>{item.name.toUpperCase()}</span>
                          ) : null}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className="rounded-xl border-none text-gray-900 shadow-lg">
                          <MenuLayoutRenderer item={item} pathname={pathname} />
                        </NavigationMenuContent>
                      </>
                    ) : item.absoluteHref ? (
                      <NavigationMenuLink
                        render={
                          <Link
                            href={item.absoluteHref}
                            aria-label={item.name || item.icon || "Link"}
                            className={cn(
                              navigationMenuTriggerStyle(),
                              "hover:text-primary-700 focus:text-primary-700 flex items-center gap-1.5 text-gray-50 transition-colors hover:bg-white focus:bg-white",
                              pathname === item.absoluteHref &&
                                "text-primary-700 bg-white font-bold",
                            )}
                          />
                        }
                      >
                        {item.icon && (
                          <span className="relative inline-block size-5 shrink-0 overflow-hidden rounded-full bg-white">
                            <Image
                              unoptimized
                              src={`/svgs/menu-icons/${item.icon}.svg`}
                              alt={item.name || item.icon}
                              fill
                              className="rounded-full object-contain"
                            />
                          </span>
                        )}
                        {item.name ? (
                          <span>{item.name.toUpperCase()}</span>
                        ) : null}
                      </NavigationMenuLink>
                    ) : (
                      <span
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "flex cursor-default items-center gap-1.5 bg-transparent text-gray-50 select-none",
                        )}
                      >
                        {item.icon && (
                          <span className="relative inline-block size-5 shrink-0 overflow-hidden rounded-full bg-white">
                            <Image
                              unoptimized
                              src={`/svgs/menu-icons/${item.icon}.svg`}
                              alt={item.name || item.icon}
                              fill
                              className="rounded-full object-contain"
                            />
                          </span>
                        )}
                        {item.name ? (
                          <span>{item.name.toUpperCase()}</span>
                        ) : null}
                      </span>
                    )}
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>

      {/* Right Actions (Desktop) */}
      <div className="hidden items-center space-x-2 lg:flex">
        <div className="p-1 text-gray-50">
          <AppPostSearchButton id="desktop-navbar-search" />
        </div>
        <LocaleSwitcher />
      </div>

      {/* Right Actions & Mobile Toggle (Mobile) */}
      <div className="flex items-center space-x-2 text-gray-50 lg:hidden">
        <AppPostSearchButton id="mobile-navbar-search" />
        <LocaleSwitcher />
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger className="-mr-2 p-2 text-gray-50 hover:text-gray-200 focus:outline-none">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle mobile menu</span>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[300px] overflow-y-auto border-r-0 bg-white text-gray-900 sm:w-[350px]"
          >
            <SheetHeader className="mb-6 border-b pb-4 text-left">
              <SheetTitle>
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3"
                >
                  {typeof logo?.url === "string" ? (
                    <div className="relative h-12 w-12 shrink-0">
                      <Image
                        src={logo.url}
                        alt={logo.alt || "Logo"}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : null}
                  <span className="text-lg leading-tight font-bold">
                    Hội Dòng
                    <br />
                    Đa Minh Gò Vấp
                  </span>
                </Link>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-2">
              <Accordion className="w-full">
                {menu.map((item, index) => {
                  const hasContent = hasSubContent(item);

                  return (
                    <div
                      key={index}
                      className="border-b border-gray-100 last:border-0"
                    >
                      {hasContent ? (
                        <AccordionItem
                          value={`item-${index}`}
                          className="border-none"
                        >
                          <div className="flex items-center justify-between">
                            {item.absoluteHref ? (
                              <Link
                                href={item.absoluteHref}
                                onClick={() => setMobileMenuOpen(false)}
                                aria-label={item.name || item.icon || "Menu"}
                                className={cn(
                                  "hover:text-primary-600 flex flex-1 items-center gap-2 px-2 py-3 text-base font-medium text-gray-800 transition-colors",
                                  pathname === item.absoluteHref &&
                                    "text-primary-600",
                                )}
                              >
                                {item.icon && (
                                  <span className="relative inline-block size-5 shrink-0 overflow-hidden rounded-full bg-white">
                                    <Image
                                      unoptimized
                                      src={`/svgs/menu-icons/${item.icon}.svg`}
                                      alt={item.name || item.icon}
                                      fill
                                      className="rounded-full object-contain"
                                    />
                                  </span>
                                )}
                                {item.name ? <span>{item.name}</span> : null}
                              </Link>
                            ) : (
                              <div className="flex flex-1 items-center gap-2 px-2 py-3 text-base font-medium text-gray-800">
                                {item.icon && (
                                  <span className="relative inline-block size-5 shrink-0 overflow-hidden rounded-full bg-white">
                                    <Image
                                      unoptimized
                                      src={`/svgs/menu-icons/${item.icon}.svg`}
                                      alt={item.name || item.icon}
                                      fill
                                      className="rounded-full object-contain"
                                    />
                                  </span>
                                )}
                                {item.name ? <span>{item.name}</span> : null}
                              </div>
                            )}
                            <AccordionTrigger className="hover:text-primary-600 w-10 shrink-0 justify-center p-2 text-gray-500 hover:no-underline" />
                          </div>
                          <AccordionContent className="pb-3 pl-4">
                            <ul className="flex flex-col gap-2 border-l-2 border-gray-100 pl-4">
                              {/* Layout 1: Grid */}
                              {/* Layout 1: Grid */}
                              {item.layout === "grid" &&
                                item.children?.map((child, childIndex) => (
                                  <li key={childIndex}>
                                    {child.absoluteHref ? (
                                      <Link
                                        href={child.absoluteHref}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                          "hover:text-primary-600 flex items-center gap-2 py-2 text-base text-gray-700 transition-colors",
                                          pathname === child.absoluteHref &&
                                            "text-primary-600 font-semibold",
                                        )}
                                      >
                                        {child.icon && (
                                          <span className="relative inline-block size-5 shrink-0 overflow-hidden rounded-full bg-white">
                                            <Image
                                              unoptimized
                                              src={`/svgs/menu-icons/${child.icon}.svg`}
                                              alt={child.name || child.icon}
                                              fill
                                              className="rounded-full object-contain"
                                            />
                                          </span>
                                        )}
                                        <span>{child.name}</span>
                                      </Link>
                                    ) : (
                                      <span className="flex items-center gap-2 py-2 text-base font-medium text-gray-700">
                                        {child.icon && (
                                          <span className="relative inline-block size-5 shrink-0 overflow-hidden rounded-full bg-white">
                                            <Image
                                              unoptimized
                                              src={`/svgs/menu-icons/${child.icon}.svg`}
                                              alt={child.name || child.icon}
                                              fill
                                              className="rounded-full object-contain"
                                            />
                                          </span>
                                        )}
                                        <span>{child.name}</span>
                                      </span>
                                    )}
                                  </li>
                                ))}

                              {/* Layout 2: Pillars */}
                              {item.layout === "pillars" && (
                                <>
                                  {item.pillars?.map((pillar, pIdx) => (
                                    <li key={pIdx} className="space-y-1 py-1">
                                      {pillar.headerBanner.absoluteHref ? (
                                        <Link
                                          href={
                                            pillar.headerBanner.absoluteHref
                                          }
                                          onClick={() =>
                                            setMobileMenuOpen(false)
                                          }
                                          className={cn(
                                            "hover:text-primary-600 block text-base font-bold uppercase transition-colors",
                                            pathname ===
                                              pillar.headerBanner.absoluteHref
                                              ? "text-primary-600"
                                              : "text-gray-800",
                                          )}
                                        >
                                          {pillar.headerBanner.title}
                                        </Link>
                                      ) : (
                                        <span className="text-base font-bold text-gray-700 uppercase">
                                          {pillar.headerBanner.title}
                                        </span>
                                      )}
                                      {pillar.links.map((link, lIdx) => (
                                        <div key={lIdx}>
                                          {link.absoluteHref ? (
                                            <Link
                                              key={lIdx}
                                              href={link.absoluteHref}
                                              onClick={() =>
                                                setMobileMenuOpen(false)
                                              }
                                              className={cn(
                                                "hover:text-primary-600 flex items-center gap-2 py-1.5 text-base text-gray-700 transition-colors",
                                                pathname ===
                                                  link.absoluteHref &&
                                                  "text-primary-600 font-semibold",
                                              )}
                                            >
                                              {link.icon && (
                                                <span className="relative inline-block size-4 shrink-0 overflow-hidden rounded-full bg-white">
                                                  <Image
                                                    unoptimized
                                                    src={`/svgs/menu-icons/${link.icon}.svg`}
                                                    alt={link.name || link.icon}
                                                    fill
                                                    className="rounded-full object-contain"
                                                  />
                                                </span>
                                              )}
                                              <span>{link.name}</span>
                                            </Link>
                                          ) : (
                                            <span className="flex items-center gap-2 py-1.5 text-base text-gray-600">
                                              {link.icon && (
                                                <span className="relative inline-block size-4 shrink-0 overflow-hidden rounded-full bg-white">
                                                  <Image
                                                    unoptimized
                                                    src={`/svgs/menu-icons/${link.icon}.svg`}
                                                    alt={link.name || link.icon}
                                                    fill
                                                    className="rounded-full object-contain"
                                                  />
                                                </span>
                                              )}
                                              <span>{link.name}</span>
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                    </li>
                                  ))}
                                  {item.bottomBar?.links.map((link, bIdx) => (
                                    <li key={`b-${bIdx}`}>
                                      {link.absoluteHref ? (
                                        <Link
                                          href={link.absoluteHref}
                                          onClick={() =>
                                            setMobileMenuOpen(false)
                                          }
                                          className={cn(
                                            "hover:text-primary-600 flex items-center gap-2 py-1.5 text-base font-medium text-gray-700 transition-colors",
                                            pathname === link.absoluteHref &&
                                              "text-primary-600 font-semibold",
                                          )}
                                        >
                                          {link.icon && (
                                            <span className="relative inline-block size-4 shrink-0 overflow-hidden rounded-full bg-white">
                                              <Image
                                                unoptimized
                                                src={`/svgs/menu-icons/${link.icon}.svg`}
                                                alt={link.name || link.icon}
                                                fill
                                                className="rounded-full object-contain"
                                              />
                                            </span>
                                          )}
                                          <span>{link.name}</span>
                                        </Link>
                                      ) : (
                                        <span className="flex items-center gap-2 py-1.5 text-base font-medium text-gray-600">
                                          {link.icon && (
                                            <span className="relative inline-block size-4 shrink-0 overflow-hidden rounded-full bg-white">
                                              <Image
                                                unoptimized
                                                src={`/svgs/menu-icons/${link.icon}.svg`}
                                                alt={link.name || link.icon}
                                                fill
                                                className="rounded-full object-contain"
                                              />
                                            </span>
                                          )}
                                          <span>{link.name}</span>
                                        </span>
                                      )}
                                    </li>
                                  ))}
                                </>
                              )}

                              {/* Layout 3: Tabs + Posts Categories */}
                              {item.layout === "tabs-posts" &&
                                item.categories?.map((cat, catIdx) => (
                                  <li key={catIdx}>
                                    {cat.absoluteHref ? (
                                      <Link
                                        href={cat.absoluteHref}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                          "hover:text-primary-600 flex items-center gap-2 py-2 text-base text-gray-700 transition-colors",
                                          pathname === cat.absoluteHref &&
                                            "text-primary-600 font-semibold",
                                        )}
                                      >
                                        {cat.icon && (
                                          <span className="relative inline-block size-4 shrink-0 overflow-hidden rounded-full bg-white">
                                            <Image
                                              unoptimized
                                              src={`/svgs/menu-icons/${cat.icon}.svg`}
                                              alt={cat.name || cat.icon}
                                              fill
                                              className="rounded-full object-contain"
                                            />
                                          </span>
                                        )}
                                        <span>{cat.name}</span>
                                      </Link>
                                    ) : (
                                      <span className="flex items-center gap-2 py-2 text-base font-medium text-gray-700">
                                        {cat.icon && (
                                          <span className="relative inline-block size-4 shrink-0 overflow-hidden rounded-full bg-white">
                                            <Image
                                              unoptimized
                                              src={`/svgs/menu-icons/${cat.icon}.svg`}
                                              alt={cat.name || cat.icon}
                                              fill
                                              className="rounded-full object-contain"
                                            />
                                          </span>
                                        )}
                                        <span>{cat.name}</span>
                                      </span>
                                    )}
                                  </li>
                                ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      ) : item.absoluteHref ? (
                        <Link
                          href={item.absoluteHref}
                          onClick={() => setMobileMenuOpen(false)}
                          aria-label={item.name || item.icon || "Link"}
                          className={cn(
                            "hover:text-primary-600 flex items-center gap-2 px-2 py-3 text-base font-medium text-gray-800 transition-colors",
                            pathname === item.absoluteHref &&
                              "text-primary-600",
                          )}
                        >
                          {item.icon && (
                            <span className="relative inline-block size-5 shrink-0 overflow-hidden rounded-full bg-white">
                              <Image
                                unoptimized
                                src={`/svgs/menu-icons/${item.icon}.svg`}
                                alt={item.name || item.icon}
                                fill
                                className="rounded-full object-contain"
                              />
                            </span>
                          )}
                          {item.name ? <span>{item.name}</span> : null}
                        </Link>
                      ) : (
                        <div className="flex items-center gap-2 px-2 py-3 text-base font-medium text-gray-800 select-none">
                          {item.icon && (
                            <span className="relative inline-block size-5 shrink-0 overflow-hidden rounded-full bg-white">
                              <Image
                                unoptimized
                                src={`/svgs/menu-icons/${item.icon}.svg`}
                                alt={item.name || item.icon}
                                fill
                                className="rounded-full object-contain"
                              />
                            </span>
                          )}
                          {item.name ? <span>{item.name}</span> : null}
                        </div>
                      )}
                    </div>
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
