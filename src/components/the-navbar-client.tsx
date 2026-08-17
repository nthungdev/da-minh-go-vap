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

interface TheNavbarClientProps {
  menu: MenuItem[];
  logo?: Media | null;
}

export default function TheNavbarClient({ menu, logo }: TheNavbarClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <div className="flex flex-1 items-center justify-between lg:justify-start lg:space-x-8">
        {/* Brand & Logo (Desktop & Mobile) */}
        <Link href="/" className="relative z-20 flex shrink-0 items-center">
          {/* Mobile Text Brand (visible only on mobile if logo not used, but let's show logo or text) */}
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

          {/* Desktop Logo (with the original overlapping design) */}
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
              {menu.map((item, index) => (
                <NavigationMenuItem key={index}>
                  {item.children && item.children.length > 0 ? (
                    <>
                      <NavigationMenuTrigger className="hover:bg-primary-600 data-[state=open]:bg-primary-600 focus:bg-primary-600 hover:text-primary bg-transparent">
                        {item.name.toUpperCase()}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="bg-primary-600 border-none text-gray-50 shadow-lg">
                        <ul className="grid w-[400px] gap-2 p-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                          {item.children.map((child, childIndex) => (
                            <li key={childIndex}>
                              <NavigationMenuLink
                                render={
                                  <Link
                                    href={child.absoluteHref}
                                    className={twMerge(
                                      "hover:bg-primary-700 focus:bg-primary-700 block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:text-white",
                                      pathname === child.absoluteHref &&
                                        "bg-primary-700",
                                    )}
                                  />
                                }
                              >
                                <div className="leading-none font-medium">
                                  {child.name}
                                </div>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
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
                            pathname === item.absoluteHref && "bg-primary-600",
                          )}
                        />
                      }
                    >
                      {item.name.toUpperCase()}
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
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
                {menu.map((item, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-100 last:border-0"
                  >
                    {item.children && item.children.length > 0 ? (
                      <AccordionItem
                        value={`item-${index}`}
                        className="border-none"
                      >
                        <AccordionTrigger className="hover:text-primary-600 px-2 py-3 font-medium text-gray-800 transition-colors hover:no-underline">
                          {item.name}
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 pl-4">
                          <ul className="flex flex-col gap-2 border-l-2 border-gray-100 pl-4">
                            {item.children.map((child, childIndex) => (
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
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ) : (
                      <Link
                        href={item.absoluteHref}
                        onClick={() => setMobileMenuOpen(false)}
                        className={twMerge(
                          "hover:text-primary-600 block px-2 py-3 font-medium text-gray-800 transition-colors",
                          pathname === item.absoluteHref && "text-primary-600",
                        )}
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
              </Accordion>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
