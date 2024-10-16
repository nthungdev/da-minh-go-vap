import Link from 'next/link'
import { attributes as siteAttributes } from '@/content/settings/site.md'
import Image from 'next/image'
import menu from '@/utils/menu'
import classNames from 'classnames'
import AppPostSearchButton from './app-post-search-button'

interface TheDesktopNavbarProps {
  className?: string
}

export default function TheDesktopNavbar({ className }: TheDesktopNavbarProps) {
  const { logo } = siteAttributes as SiteAttributes

  return (
    <nav
      className={classNames(
        `bg-primary text-gray-50 xl:flex flex-row flex-wrap lg:justify-center`,
        className
      )}
    >
      <div className="lg:flex flex-row flex-wrap items-center max-w-screen-xl">
        <div className="z-20 relative h-full w-20 self-start">
          <div className="absolute top-[20%] left-0 overflow-auto h-20 w-20">
            <Image
              src={logo.url}
              alt={logo.alt}
              quality={100}
              sizes="100%"
              fill
              priority
            />
          </div>
        </div>

        <ul className="lg:flex flex-row flex-wrap items-center">
          {menu.map((link, index) => (
            <li key={link.href} className="relative flex flex-row z-30">
              {index !== 0 && <div className="border-l my-2"></div>}

              <Link className="block peer px-3 py-3" href={link.href}>
                {link.name.toUpperCase()}
              </Link>

              {link.children && (
                <ul className="z-20 hidden peer-hover:block hover:block absolute top-full left-0 bg-primary-500 divide-y min-w-full">
                  {link.children.map((child) => (
                    <li key={child.href} className="block relative">
                      <Link
                        href={`${link.href}${child.href}`}
                        className="block peer text-nowrap px-4 py-2 hover:bg-primary-700 hover:text-gray-50"
                      >
                        {child.name}
                      </Link>

                      {child.children && (
                        <ul className="hidden peer-hover:block hover:block absolute left-full top-0 bg-primary-400 divide-y">
                          {child.children.map((grandchild) => (
                            <li key={grandchild.href} className="block">
                              <Link
                                href={`${link.href}${child.href}${grandchild.href}`}
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

        <AppPostSearchButton id="desktop-navbar-search" />
      </div>
    </nav>
  )
}
