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
        `bg-primary flex-row flex-wrap text-gray-50 lg:justify-center xl:flex`,
        props.className,
      )}
    >
      <div className="max-w-7xl flex-row flex-wrap items-center lg:flex">
        <div className="relative z-20 h-full w-20 self-start">
          <div className="absolute top-[20%] left-0 size-20 overflow-auto">
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

        <ul className="flex-row flex-wrap items-center lg:flex">
          {menu.map((link, index) => (
            <li key={index} className="relative z-30 flex flex-row">
              {index !== 0 && <div className="my-2 border-l"></div>}

              <Link className="peer block p-3" href={link.href}>
                {link.name.toUpperCase()}
              </Link>

              {link.children && link.children.length !== 0 && (
                <ul className="bg-primary-600 absolute top-full left-0 z-20 hidden min-w-full divide-y peer-hover:block hover:block">
                  {link.children.map((child, index) => (
                    <li key={index} className="relative block">
                      <Link
                        href={`${child.absoluteHref}`}
                        className={twMerge(
                          "peer hover:bg-primary-800 flex flex-row justify-between space-x-2 py-2 pr-2 pl-4 text-nowrap hover:text-gray-50",
                          !child.children && "pr-4",
                        )}
                      >
                        <span>{child.name}</span>
                        {!!child.children?.length && (
                          <span>
                            <svg
                              className="h-6 w-6"
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
                        <ul className="bg-primary-600 absolute top-0 left-full ml-px hidden divide-y peer-hover:block hover:block">
                          {child.children.map((grandchild, index) => (
                            <li key={index} className="block">
                              <Link
                                href={`${grandchild.absoluteHref}`}
                                className="hover:bg-primary-700 block px-4 py-2 text-nowrap hover:text-gray-50"
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
