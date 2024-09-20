import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NavBar from '../components/the-nav-bar'
import ThePrelineScript from '@/components/the-preline-script'
import TheFooter from '@/components/the-footer'

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
  return (
    <html lang="en">
      <body
        className={`bg-gray-50 w-full h-screen flex flex-col ${inter.className}`}
      >
        <NavBar />
        <div className="flex-1">{children}</div>
        <ThePrelineScript />
        <TheFooter />
      </body>
    </html>
  )
}
