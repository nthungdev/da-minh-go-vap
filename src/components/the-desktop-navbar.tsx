import Link from "next/link";
import Image from "next/image";
import { MenuItem } from "@/utils/menu";
import AppPostSearchButton from "./app-post-search-button";
import { HTMLAttributes } from "react";
import { Media } from "@/payload-types";
import { twMerge } from "tailwind-merge";

interface TheDesktopNavbarProps extends HTMLAttributes<HTMLElement> {
  menu: MenuItem[];
  logo?: Media;
}

export default async function TheDesktopNavbar({
  logo,
  menu,
  ...props
}: TheDesktopNavbarProps) {
  return (
    <nav
      className={twMerge(
        `bg-primary text-gray-50 xl:flex flex-row flex-wrap lg:justify-center`,
        props.className,
      )}
    >
      <div className="lg:flex flex-row flex-wrap items-center max-w-screen-xl">
        <div className="z-20 relative h-full w-20 self-start">
          <div className="absolute top-[20%] left-0 overflow-auto size-20">
            {typeof logo?.url === "string" && (
              <Image
                src={logo.url}
                alt={logo.alt}
                quality={100}
                sizes="100%"
                fill
                priority
              />
            )}
          </div>
        </div>

        <ul className="lg:flex flex-row flex-wrap items-center">
          {menu.map((link, index) => (
            <li key={index} className="relative flex flex-row z-30">
              {index !== 0 && <div className="border-l my-2"></div>}

              <Link className="block peer p-3" href={link.href}>
                {link.name.toUpperCase()}
              </Link>

              {link.children && link.children.length !== 0 && (
                <ul className="z-20 hidden peer-hover:block hover:block absolute top-full left-0 bg-primary-600 divide-y min-w-full">
                  {link.children.map((child, index) => (
                    <li key={index} className="block relative">
                      <Link
                        href={`${child.absoluteHref}`}
                        className={twMerge(
                          "flex flex-row justify-between space-x-2 peer text-nowrap pl-4 pr-2 py-2 hover:bg-primary-800 hover:text-gray-50",
                          !child.children && "pr-4",
                        )}
                      >
                        <span>{child.name}</span>
                        {!!child.children?.length && (
                          <span>
                            <svg
                              className="w-6 h-6"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="m10 16 4-4-4-4"
                              />
                            </svg>
                          </span>
                        )}
                      </Link>

                      {child.children && child.children.length !== 0 && (
                        <ul className="hidden peer-hover:block hover:block absolute left-full top-0 bg-primary-600 divide-y ml-px">
                          {child.children.map((grandchild) => (
                            <li key={grandchild.href} className="block">
                              <Link
                                href={`${grandchild.absoluteHref}`}
                                className="block text-nowrap px-4 py-2 hover:bg-primary-700 hover:text-gray-50"
                              >
                                {grandchild.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        <div className="p-3">
          <AppPostSearchButton id="desktop-navbar-search" />
        </div>
      </div>
    </nav>
  );
}
