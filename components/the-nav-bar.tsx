'use client'

import Link from 'next/link'
import { attributes as siteAttributes } from '@/content/settings/site.md'
import { attributes as navbarAttributes } from '@/content/settings/navbar.md'
import Image from 'next/image'
import TheMobileMenu from './the-mobile-menu'
import menu from '@/utils/menu'
import AppBanners from './app-banners'
import { usePathname } from 'next/navigation'

interface TheNavBarProps {
  className?: string
}

export default function TheNavBar({ className }: TheNavBarProps) {
  const { logo } = siteAttributes as SiteAttributes
  const { homeBanners, bottomDecorativeGraphic } =
    navbarAttributes as NavbarAttributes

  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <div>
      <nav
        className={`relative z-60 bg-[#427CA8] text-gray-50 flex flex-row flex-wrap lg:justify-center ${className}`}
      >
        <div className="lg:hidden p-2 flex-1">
          <TheMobileMenu />
        </div>

        <ul className="hidden lg:flex flex-row flex-wrap items-center max-w-screen-xl">
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

          {menu.map((link) => (
            <li key={link.href} className="relative flex flex-row">
              <Link className="block peer px-3 py-4" href={link.href}>
                {link.name.toUpperCase()}
              </Link>

              {link.children && (
                <ul className="z-20 hidden peer-hover:block hover:block absolute top-full left-0 bg-primary-400">
                  {link.children.map((child) => (
                    <li key={child.href} className="block relative">
                      <Link
                        href={`${link.href}${child.href}`}
                        className="block peer text-nowrap px-4 py-2 hover:bg-primary-700 hover:text-gray-50"
                      >
                        {child.name}
                      </Link>

                      {child.children && (
                        <ul className="hidden peer-hover:block hover:block absolute left-full top-0 bg-primary-400">
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
      </nav>

      {isHome && (
        <div className="w-full">
          <AppBanners banners={homeBanners} />
        </div>
      )}

      <Image
        src={bottomDecorativeGraphic.url}
        alt={bottomDecorativeGraphic.alt}
        className="hidden lg:block w-full"
        width={1080}
        height={720}
        quality={100}
        sizes="100%"
        priority
      />
    </div>
  )
}
