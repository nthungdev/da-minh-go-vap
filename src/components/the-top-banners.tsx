'use client'

import { usePathname } from 'next/navigation'
import { attributes as navbarAttributes } from '@/content/settings/navbar.md'
import AppBanners from './app-banners'
import { twMerge } from 'tailwind-merge'

interface TheTopBannersProps {
  className?: string
}

export default function TheTopBanners({ className }: TheTopBannersProps) {
  const { pageBanners } = navbarAttributes as NavbarAttributes

  const pathname = usePathname()
  const banners = pageBanners.find((banner) => pathname == banner.path)?.banners
  const hasBanners = !!banners

  return (
    <div className={twMerge('w-full', className)}>
      {hasBanners && <AppBanners banners={banners} />}
    </div>
  )
}
