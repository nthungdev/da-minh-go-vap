import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ThePrelineScript from '@/components/the-preline-script'
import TheFooter from '@/components/the-footer'
import Image from 'next/image'
import { attributes as navbarAttributes } from '@/content/settings/navbar.md'
import TheTopBanners from '@/components/the-top-banners'
import classNames from 'classnames'
import TheMobileNavbar from '@/components/the-mobile-navbar'
import TheDesktopNavbar from '@/components/the-desktop-navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Đa Minh Gò Vấp',
  description: 'Hội dòng Đa Minh Gò Vấp',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { bottomDecorativeGraphic } = navbarAttributes as NavbarAttributes

  return (
    <html lang="en">
      <body
        className={classNames(
          'relative bg-gray-100 flex flex-col w-full min-h-screen',
          inter.className
        )}
      >
        <TheDesktopNavbar className="z-20 sticky top-0 hidden xl:flex" />
        <TheMobileNavbar className="z-20 sticky top-0 xl:hidden" />
        <TheTopBanners />

        {/* Dynamically render the bottom decorative graphic based on the screen size */}
        <picture className="w-full block sticky top-[55px] xl:top-[48px] z-10">
          <source
            media="(max-width: 799px)"
            srcSet={bottomDecorativeGraphic.urlMobile}
          />
          <source
            media="(min-width: 800px)"
            srcSet={bottomDecorativeGraphic.urlDesktop}
          />
          <img
            className="w-full"
            src={bottomDecorativeGraphic.urlMobile}
            alt={bottomDecorativeGraphic.alt}
          />
        </picture>

        <div className="flex-1">{children}</div>
        <ThePrelineScript />
        <TheFooter />
      </body>
    </html>
  )
}
