import type { Metadata } from 'next'
import { Montserrat, Nunito } from 'next/font/google'
import { twMerge } from 'tailwind-merge'
import ThePrelineScript from '@/components/the-preline-script'
import TheFooter from '@/components/the-footer'
import { attributes as navbarAttributes } from '@/content/settings/navbar.md'
import TheTopBanners from '@/components/the-top-banners'
import TheMobileNavbar from '@/components/the-mobile-navbar'
import TheDesktopNavbar from '@/components/the-desktop-navbar'
import ReactQueryProvider from '@/components/providers/react-query-provider'
import { NavbarAttributes } from '@/definitions'
import './globals.css'
import { getMenu } from '@/utils/menu'
import { getLogo } from '@/utils/siteSettings'

const montserrat = Montserrat({
  subsets: ['vietnamese'],
  variable: '--font-montserrat',
})

const nunito = Nunito({
  subsets: ['vietnamese'],
  variable: '--font-nunito',
})

export const metadata: Metadata = {
  title: 'Đa Minh Gò Vấp',
  description: 'Hội dòng Đa Minh Gò Vấp',
}

const language = 'vi'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { bottomDecorativeGraphic } = navbarAttributes as NavbarAttributes
  const menu = await getMenu()
  const logo = await getLogo()

  return (
    <html
      lang={language}
      className={twMerge(nunito.className, montserrat.className)}
    >
      <ThePrelineScript />

      <body
        className={twMerge(
          'relative bg-white flex flex-col w-full min-h-screen'
        )}
      >
        <TheDesktopNavbar logo={logo} menu={menu} className="z-20 sticky top-0 hidden xl:flex" />
        {/* z-60 because backdrop from Preline is z-59 */}
        <TheMobileNavbar menu={menu} className="z-[60] sticky top-0 xl:hidden" />

        <div className="relative">
          <TheTopBanners />
          <picture className="w-full block absolute -bottom-[1px] z-10">
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
        </div>

        <ReactQueryProvider>
          <div className="flex-1">{children}</div>
        </ReactQueryProvider>
        <TheFooter />
      </body>
    </html>
  )
}
