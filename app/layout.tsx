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
          'bg-gray-50 flex flex-col w-full min-h-screen',
          inter.className
        )}
      >
        <TheDesktopNavbar className="z-10" />
        <TheMobileNavbar />
        <TheTopBanners />
        <Image
          src={bottomDecorativeGraphic.url}
          alt={bottomDecorativeGraphic.alt}
          className="hidden lg:block w-full pointer-events-none"
          width={1080}
          height={720}
          quality={100}
          sizes="100%"
          priority
        />
        <div className="flex-1">{children}</div>
        <ThePrelineScript />
        <TheFooter />
      </body>
    </html>
  )
}
