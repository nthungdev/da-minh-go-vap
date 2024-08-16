'use client'


import menu from '@/utils/menu'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HSOverlay } from 'preline/preline'

const MENU_ID = 'hs-the-mobile-menu'

export default function TheMobileMenu() {
  const pathname = usePathname()

  const closeMenu = async () => {
    const menuElement = document.querySelector<HTMLElement>(`#${MENU_ID}`)
    if (!menuElement) {
      console.error('Menu element not found')
      return
    }
    HSOverlay.close(menuElement)
  }

  return (
    <div>
      {/* Navigation Toggle */}
      <button
        type="button"
        className="fill-gray-50 hover:fill-primary-900 focus:fill-primary-900 p-2 inline-flex justify-center items-center gap-x-2 text-start text-white text-sm font-medium rounded-lg shadow-sm align-middle focus:outline-none"
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
          aria-labelledby="a3mj0osd8yblbhwt1scru448yoh362oy"
          className="crayons-icon"
        >
          <title id="a3mj0osd8yblbhwt1scru448yoh362oy">Navigation menu</title>
          <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"></path>
        </svg>
      </button>
      {/* End Navigation Toggle */}

      {/* Sidebar */}
      <div
        id={MENU_ID}
        className="hs-overlay [--auto-close:lg] hs-overlay-open:translate-x-0 -translate-x-full transition-all duration-300 transform hidden fixed top-0 start-0 bottom-0 z-[60] w-72 bg-white border-e border-gray-200 pt-7 pb-10 overflow-y-auto lg:block lg:translate-x-0 lg:end-auto lg:bottom-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300"
        role="dialog"
        tabIndex={-1}
        aria-label="Sidebar"
      >
        <div className="px-6">
          <Link
            className="flex-none font-semibold text-xl text-black focus:outline-none focus:opacity-80"
            href="/"
            aria-label="Brand"
          >
            Đa Minh Gò Vấp
          </Link>
        </div>

        <div
          className="hs-accordion-group p-6 w-full flex flex-col flex-wrap"
          data-hs-accordion-always-open
        >
          <ul className="space-y-1.5">
            {menu.map((link, index) =>
              link.children ? (
                <li key={index} className="hs-accordion" id={`${link.normalizedName}-accordion`}>
                  <button
                    type="button"
                    className="hs-accordion-toggle hs-accordion-active:text-gray-50 hs-accordion-active:bg-primary-400 hs-accordion-active:hover:bg-primary-500 w-full text-start flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-700 rounded-lg hover:text-gray-50 hover:bg-primary-500 focus:outline-none focus:bg-primary-500 focus:text-gray-50"
                    aria-expanded="true"
                    aria-controls={`${link.normalizedName}-accordion`}
                  >
                    <Link
                      className='pr-2'
                      href={link.href}
                      onMouseOver={event => {
                        event.stopPropagation()
                      }}
                    >
                      {link.name}
                    </Link>
                    <svg
                      className="hs-accordion-active:block ms-auto hidden p-2 size-4 text-gray-600 group-hover:text-gray-500"
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
                    <svg
                      className="hs-accordion-active:hidden ms-auto block size-4 text-gray-600 group-hover:text-gray-500"
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

                  <div
                    id={`${link.normalizedName}-accordion`}
                    className="hs-accordion-content w-full overflow-hidden transition-[height] duration-300 hidden"
                    role="region"
                    aria-labelledby={`${link.normalizedName}-accordion`}
                  >
                    <ul className="pt-2 ps-2 space-y-1">
                      {link.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            className="flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-700 rounded-lg hover:bg-primary-200 focus:outline-none focus:bg-primary-200"
                            href={link.href + child.href}
                            onClick={closeMenu}
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ) : (
                <li key={index}>
                  <Link
                    className={`flex items-center gap-x-3.5 py-2 px-2.5 text-sm rounded-lg w-full text-start hover:text-gray-50 hover:bg-primary-500 focus:outline-none focus:bg-primary-500 focus:text-gray-50 ${link.href === pathname ? 'text-gray-50 bg-primary-400 hover:bg-primary-500' : 'text-gray-900'
                      }`}
                    href={link.href}
                    onClick={closeMenu}
                  >
                    {link.name}
                  </Link>
                </li>
              )
            )}
          </ul>
        </div>
      </div>
      {/* End Sidebar */}
    </div>
  )
}
