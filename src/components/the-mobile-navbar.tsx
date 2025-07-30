"use client";

import { MenuItem } from "@/utils/menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AppPostSearchButton from "./app-post-search-button";
import { HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

const MENU_ID = "hs-the-mobile-menu";

// TODO - Refactor this component

interface MobileMenuRootProps {
  items: MenuItem[];
  itemRender: (item: MenuItem, index: number) => React.ReactNode;
}

function MobileMenuRoot(props: MobileMenuRootProps) {
  const { items, itemRender } = props;

  return (
    <div
      className="hs-accordion-group flex w-full flex-col flex-wrap p-6"
      data-hs-accordion-always-open
    >
      <ul className="space-y-1.5">{items.map(itemRender)}</ul>
    </div>
  );
}

interface MobileMenuContentProps {
  id: string;
  labelledbyId: string;
  children: React.ReactNode;
}

function MobileMenuContent(props: MobileMenuContentProps) {
  const { id, labelledbyId, children } = props;

  return (
    <div
      id={id}
      className="hs-accordion-content hidden w-full overflow-hidden transition-[height] duration-300"
      role="region"
      aria-labelledby={labelledbyId}
    >
      {children}
    </div>
  );
}

interface MobileMenuToggleProps {
  label: string;
  controlsId: string;
  href: string;
}

function MobileMenuToggle(props: MobileMenuToggleProps) {
  const { label, controlsId, href } = props;

  return (
    <button
      type="button"
      className="hs-accordion-toggle group flex w-full items-center gap-x-3.5 rounded-lg px-2.5 py-2 text-start text-sm text-gray-700 focus:outline-hidden"
      aria-expanded="true"
      aria-controls={controlsId}
    >
      <Link
        className="pr-2"
        href={href}
        onMouseOver={(event) => {
          event.stopPropagation();
        }}
      >
        {label}
      </Link>

      {/* Up caret */}
      <svg
        className="hs-accordion-active:block ms-auto hidden size-4 text-gray-600"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
      {/* Down caret */}
      <svg
        className="hs-accordion-active:hidden ms-auto block size-4 text-gray-600"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}

const defaultItemRender = (onClick: () => void) =>
  function Item(item: MenuItem, index: number) {
    const pathname = usePathname();

    if (item.children?.length) {
      return (
        <li
          key={`${item.normalizedName}-accordion-item`}
          id={`${item.normalizedName}-accordion-item`}
          className="hs-accordion"
        >
          <MobileMenuToggle
            label={item.name}
            controlsId={`${item.normalizedName}-accordion`}
            href={item.absoluteHref}
          />

          <MobileMenuContent
            id={`${item.normalizedName}-accordion`}
            labelledbyId={`${item.normalizedName}-accordion-item`}
          >
            <ul className="space-y-1 ps-2 pt-2">
              {item.children.map((child) =>
                defaultItemRender(onClick)(child, index),
              )}
            </ul>
          </MobileMenuContent>
        </li>
      );
    } else {
      return (
        <li key={`${item.normalizedName}-accordion-item`}>
          <Link
            className={`hover:bg-primary-600 focus:bg-primary-600 flex w-full items-center gap-x-3.5 rounded-lg px-2.5 py-2 text-start text-sm hover:text-gray-50 focus:text-gray-50 focus:outline-hidden ${
              item.absoluteHref === pathname
                ? "bg-primary-600 hover:bg-primary-600 text-gray-50"
                : "text-gray-900"
            }`}
            href={item.absoluteHref}
            onClick={() => onClick()}
          >
            {item.name}
          </Link>
        </li>
      );
    }
  };

interface TheMobileNavbarProps extends HTMLAttributes<HTMLElement> {
  menu: MenuItem[];
}

export default function TheMobileNavbar({
  className,
  menu,
}: TheMobileNavbarProps) {
  const closeMenu = async () => {
    const menuElement = document.querySelector<HTMLElement>(`#${MENU_ID}`);
    if (!menuElement) {
      console.error("Menu element not found");
      return;
    }
    // import preline on the client side
    const { HSOverlay } = await import("preline/preline");
    HSOverlay.close(menuElement);
  };

  return (
    <nav className={twMerge("bg-primary p-2 text-gray-50", className)}>
      {/* Navigation Toggle */}
      <div className="flex flex-row items-center">
        <button
          type="button"
          className="hover:fill-primary-900 focus:fill-primary-900 inline-flex items-center justify-center gap-x-2 rounded-lg fill-gray-50 p-2 text-start align-middle text-sm font-medium text-white shadow-xs focus:outline-hidden"
          aria-haspopup="dialog"
          aria-expanded="false"
          aria-controls={MENU_ID}
          aria-label="Toggle navigation"
          data-hs-overlay={`#${MENU_ID}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            role="img"
            aria-labelledby="mobile-nav-toggle"
            className="crayons-icon"
          >
            <title id="mobile-nav-toggle">Navigation menu</title>
            <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"></path>
          </svg>
        </button>
        <div className="ml-auto flex flex-row items-center space-x-2">
          <Link href="/" aria-label="Brand">
            Hội Dòng Đa Minh Gò Vấp
          </Link>
          <AppPostSearchButton id="mobile-navbar-search" />
        </div>
      </div>
      {/* End Navigation Toggle */}

      {/* Sidebar */}
      <div
        id={MENU_ID}
        className="hs-overlay hs-overlay-open:translate-x-0 xg:block xg:translate-x-0 xg:end-auto xg:bottom-0 fixed start-0 top-0 bottom-0 z-60 hidden h-full w-72 -translate-x-full transform overflow-y-auto border-e border-gray-200 bg-white pt-7 pb-10 transition-all duration-300 [--auto-close:lg] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-gray-100"
        role="dialog"
        tabIndex={-1}
        aria-label="Sidebar"
      >
        <div className="px-6">
          <Link
            className="flex-none text-xl font-semibold text-black focus:opacity-80 focus:outline-hidden"
            href="/"
            aria-label="Brand"
            onClick={closeMenu}
          >
            Hội Dòng
            <br />
            Đa Minh Gò Vấp
          </Link>
        </div>

        <MobileMenuDefault items={menu} />
      </div>
      {/* End Sidebar */}
    </nav>
  );
}

interface MobileMenuDefaultProps {
  items: MenuItem[];
}

function MobileMenuDefault(props: MobileMenuDefaultProps) {
  const { items } = props;

  const closeMenu = async () => {
    const menuElement = document.querySelector<HTMLElement>(`#${MENU_ID}`);
    if (!menuElement) {
      console.error("Menu element not found");
      return;
    }
    // import preline on the client side
    const { HSOverlay } = await import("preline/preline");
    HSOverlay.close(menuElement);
  };

  return (
    <MobileMenuRoot items={items} itemRender={defaultItemRender(closeMenu)} />
  );
}
