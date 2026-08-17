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
import { twMerge } from "tailwind-merge";
import { usePathname } from "next/navigation";
import MenuLayoutRenderer from "./navbar/menu-layouts/menu-layout-renderer";

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
            <span className="text-sm">
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
                        <NavigationMenuTrigger className="hover:bg-primary-600 data-[state=open]:bg-primary-600 focus:bg-primary-600 hover:text-primary bg-transparent">
                          {item.name.toUpperCase()}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className="bg-primary-600 border-none text-gray-50 shadow-lg">
                          <MenuLayoutRenderer item={item} pathname={pathname} />
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <NavigationMenuLink
                        render={
                          <Link
                            href={item.absoluteHref}
                            className={twMerge(
                              navigationMenuTriggerStyle(),
                              "hover:bg-primary-600 focus:bg-primary-600 bg-transparent text-gray-50 hover:text-white",
                              pathname === item.absoluteHref &&
                                "bg-primary-600",
                            )}
                          />
                        }
                      >
                        {item.name.toUpperCase()}
                      </NavigationMenuLink>
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
                          <AccordionTrigger className="hover:text-primary-600 px-2 py-3 font-medium text-gray-800 transition-colors hover:no-underline">
                            {item.name}
                          </AccordionTrigger>
                          <AccordionContent className="pb-3 pl-4">
                            <ul className="flex flex-col gap-2 border-l-2 border-gray-100 pl-4">
                              {/* Layout 1: Grid */}
                              {item.layout === "grid" &&
                                item.children?.map((child, childIndex) => (
                                  <li key={childIndex}>
                                    <Link
                                      href={child.absoluteHref}
                                      onClick={() => setMobileMenuOpen(false)}
                                      className={twMerge(
                                        "hover:text-primary-600 block py-2 text-sm text-gray-600 transition-colors",
                                        pathname === child.absoluteHref &&
                                          "text-primary-600 font-medium",
                                      )}
                                    >
                                      {child.name}
                                    </Link>
                                  </li>
                                ))}

                              {/* Layout 2: Pillars */}
                              {item.layout === "pillars" && (
                                <>
                                  {item.pillars?.map((pillar, pIdx) => (
                                    <li key={pIdx} className="space-y-1 py-1">
                                      <span className="text-xs font-semibold text-gray-400 uppercase">
                                        {pillar.headerBanner.title}
                                      </span>
                                      {pillar.links.map((link, lIdx) => (
                                        <Link
                                          key={lIdx}
                                          href={link.absoluteHref}
                                          onClick={() =>
                                            setMobileMenuOpen(false)
                                          }
                                          className="hover:text-primary-600 block py-1 text-sm text-gray-600"
                                        >
                                          {link.name}
                                        </Link>
                                      ))}
                                    </li>
                                  ))}
                                  {item.bottomBar?.links.map((link, bIdx) => (
                                    <li key={`b-${bIdx}`}>
                                      <Link
                                        href={link.absoluteHref}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="hover:text-primary-600 text-primary block py-1 text-sm font-medium"
                                      >
                                        {link.name}
                                      </Link>
                                    </li>
                                  ))}
                                </>
                              )}

                              {/* Layout 3: Tabs + Posts Categories */}
                              {item.layout === "tabs-posts" &&
                                item.categories?.map((cat, catIdx) => (
                                  <li key={catIdx}>
                                    <Link
                                      href={cat.absoluteHref}
                                      onClick={() => setMobileMenuOpen(false)}
                                      className={twMerge(
                                        "hover:text-primary-600 block py-2 text-sm text-gray-600 transition-colors",
                                        pathname === cat.absoluteHref &&
                                          "text-primary-600 font-medium",
                                      )}
                                    >
                                      {cat.name}
                                    </Link>
                                  </li>
                                ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      ) : (
                        <Link
                          href={item.absoluteHref}
                          onClick={() => setMobileMenuOpen(false)}
                          className={twMerge(
                            "hover:text-primary-600 block px-2 py-3 font-medium text-gray-800 transition-colors",
                            pathname === item.absoluteHref &&
                              "text-primary-600",
                          )}
                        >
                          {item.name}
                        </Link>
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
