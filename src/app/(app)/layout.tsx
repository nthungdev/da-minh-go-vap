import type { Metadata } from 'next'
import { Montserrat, Nunito } from 'next/font/google'
import { twMerge } from 'tailwind-merge'
import ThePrelineScript from '@/components/the-preline-script'
import TheFooter from '@/components/the-footer'
import TheMobileNavbar from '@/components/the-mobile-navbar'
import TheDesktopNavbar from '@/components/the-desktop-navbar'
import ReactQueryProvider from '@/components/providers/react-query-provider'
import { getMenu } from '@/utils/menu'
import { getLogo } from '@/utils/siteSettings'
import { getPayload } from 'payload'
import config from '@payload-config'
import './globals.css'

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
  const payload = await getPayload({ config })
  const navBar = await payload.findGlobal({ slug: 'navBar' })

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
        <TheDesktopNavbar
          logo={logo}
          menu={menu}
          className="z-20 sticky top-0 hidden xl:flex"
        />
        {/* z-60 because backdrop from Preline is z-59 */}
        <TheMobileNavbar
          menu={menu}
          className="z-[60] sticky top-0 xl:hidden"
        />

        <div className="relative">
          <picture className="w-full block absolute -bottom-[1px] z-10">
            {typeof navBar.bottomDecorativeGraphic?.imageMobile !== 'string' &&
              typeof navBar.bottomDecorativeGraphic?.imageMobile?.url ===
                'string' && (
                <source
                  media="(max-width: 799px)"
                  srcSet={navBar.bottomDecorativeGraphic.imageMobile.url}
                />
              )}

            {typeof navBar.bottomDecorativeGraphic?.imageDesktop !== 'string' &&
              typeof navBar.bottomDecorativeGraphic?.imageDesktop?.url ===
                'string' && (
                <source
                  media="(min-width: 800px)"
                  srcSet={navBar.bottomDecorativeGraphic.imageDesktop.url}
                />
              )}

            {typeof navBar.bottomDecorativeGraphic?.imageMobile !== 'string' &&
              typeof navBar.bottomDecorativeGraphic?.imageMobile?.url ===
                'string' && (
                <img
                  className="w-full"
                  src={navBar.bottomDecorativeGraphic.imageMobile.url}
                  alt=""
                />
              )}
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
