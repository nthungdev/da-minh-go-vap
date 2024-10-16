'use client'

import menu, { MenuItem } from '@/utils/menu'
import classNames from 'classnames'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AppPostSearchButton from './app-post-search-button'

const MENU_ID = 'hs-the-mobile-menu'

// TODO - Refactor this component

interface MobileMenuRootProps {
  items: MenuItem[]
  itemRender: (item: MenuItem, index: number) => React.ReactNode
}

function MobileMenuRoot(props: MobileMenuRootProps) {
  const { items, itemRender } = props

  return (
    <div
      className="hs-accordion-group p-6 w-full flex flex-col flex-wrap"
      data-hs-accordion-always-open
    >
      <ul className="space-y-1.5">{items.map(itemRender)}</ul>
    </div>
  )
}

interface MobileMenuContentProps {
  id: string
  labelledbyId: string
  children: React.ReactNode
}

function MobileMenuContent(props: MobileMenuContentProps) {
  const { id, labelledbyId, children } = props

  return (
    <div
      id={id}
      className="hs-accordion-content w-full overflow-hidden transition-[height] duration-300 hidden"
      role="region"
      aria-labelledby={labelledbyId}
    >
      {children}
    </div>
  )
}

interface MobileMenuToggleProps {
  label: string
  controlsId: string
  href: string
}

function MobileMenuToggle(props: MobileMenuToggleProps) {
  const { label, controlsId, href } = props

  return (
    <button
      type="button"
      className="hs-accordion-toggle group w-full text-start flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-700 rounded-lg focus:outline-none"
      aria-expanded="true"
      aria-controls={controlsId}
    >
      <Link
        className="pr-2"
        href={href}
        onMouseOver={(event) => {
          event.stopPropagation()
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
  )
}

const defaultItemRender = (onClick: Function) =>
  function Item(item: MenuItem, index: number) {
    const pathname = usePathname()

    if (item.children) {
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
            <ul className="pt-2 ps-2 space-y-1">
              {item.children.map((child) =>
                defaultItemRender(onClick)(child, index)
              )}
            </ul>
          </MobileMenuContent>
        </li>
      )
    } else {
      return (
        <li key={`${item.normalizedName}-accordion-item`}>
          <Link
            className={`flex items-center gap-x-3.5 py-2 px-2.5 text-sm rounded-lg w-full text-start hover:text-gray-50 hover:bg-primary-600 focus:outline-none focus:bg-primary-600 focus:text-gray-50 ${
              item.absoluteHref === pathname
                ? 'text-gray-50 bg-primary-600 hover:bg-primary-600'
                : 'text-gray-900'
            }`}
            href={item.absoluteHref}
            onClick={() => onClick()}
          >
            {item.name}
          </Link>
        </li>
      )
    }
  }

export default function TheMobileNavbar({ className }: { className?: string }) {
  const closeMenu = async () => {
    const menuElement = document.querySelector<HTMLElement>(`#${MENU_ID}`)
    if (!menuElement) {
      console.error('Menu element not found')
      return
    }
    // import preline on the client side
    const { HSOverlay } = await import('preline/preline')
    HSOverlay.close(menuElement)
  }

  return (
    <nav className={classNames('bg-primary text-gray-50 p-2', className)}>
      {/* Navigation Toggle */}
      <div className="flex flex-row items-center">
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
            aria-labelledby="mobile-nav-toggle"
            className="crayons-icon"
          >
            <title id="mobile-nav-toggle">Navigation menu</title>
            <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"></path>
          </svg>
        </button>
        <div className="ml-auto space-x-2 flex flex-row items-center">
          <p>Hội Dòng Đa Minh Gò Vấp</p>
          <AppPostSearchButton id="mobile-navbar-search" />
        </div>
      </div>
      {/* End Navigation Toggle */}

      {/* Sidebar */}
      <div
        id={MENU_ID}
        className="hs-overlay [--auto-close:lg] hs-overlay-open:translate-x-0 -translate-x-full transition-all duration-300 transform hidden fixed top-0 start-0 bottom-0 z-[60] h-full w-72 bg-white border-e border-gray-200 pt-7 pb-10 overflow-y-auto xg:block xg:translate-x-0 xg:end-auto xg:bottom-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300"
        role="dialog"
        tabIndex={-1}
        aria-label="Sidebar"
      >
        <div className="px-6">
          <Link
            className="flex-none font-semibold text-xl text-black focus:outline-none focus:opacity-80"
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
  )
}

interface MobileMenuDefaultProps {
  items: MenuItem[]
}

function MobileMenuDefault(props: MobileMenuDefaultProps) {
  const { items } = props

  const closeMenu = async () => {
    const menuElement = document.querySelector<HTMLElement>(`#${MENU_ID}`)
    if (!menuElement) {
      console.error('Menu element not found')
      return
    }
    // import preline on the client side
    const { HSOverlay } = await import('preline/preline')
    HSOverlay.close(menuElement)
  }

  return (
    <MobileMenuRoot items={items} itemRender={defaultItemRender(closeMenu)} />
  )
}
