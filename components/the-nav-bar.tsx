import Link from 'next/link'
import { attributes } from '@/content/settings/site.md'
import Image from 'next/image'
import TheMobileMenu from './the-mobile-menu'
import menu from '@/utils/menu'

interface TheNavBarProps {
  className?: string
}

export default function TheNavBar({ className }: TheNavBarProps) {
  const { logo } = attributes

  return (
    <nav
      className={`relative bg-primary text-gray-50 flex flex-row flex-wrap lg:justify-center ${className}`}
    >
      <div className='lg:hidden p-2'>
        <TheMobileMenu />
      </div>

      <ul className="hidden lg:flex flex-row flex-wrap items-center max-w-screen-xl">
        <div className='relative h-full w-20 self-start'>
          <div className="absolute top-[20%] left-0 overflow-auto h-20 w-20">
            <Image
              src={logo}
              alt="logo"
              quality={100}
              sizes="100%"
              fill
              priority
            />
          </div>
        </div>

        {menu.map((link) => (
          <li key={link.href} className="relative flex flex-row py-2">
            <Link className="block peer px-3 py-2" href={link.href}>
              {link.name.toUpperCase()}
            </Link>

            {link.children && (
              <div className="z-20 hidden peer-hover:block hover:block absolute top-full left-0">
                <ul className="mt-4 bg-primary-400">
                  {link.children.map((child) => (
                    <li key={child.href} className="block">
                      <Link
                        href={`${link.href}${child.href}`}
                        className="block text-nowrap px-4 py-2 hover:bg-primary-700 hover:text-gray-50"
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
