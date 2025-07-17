'use client'

import AppBanners from '@/components/app-banners'
import { Media } from '@/payload-types'
import { usePathname } from 'next/navigation'
import { twMerge } from 'tailwind-merge'

interface AppPageProps {
  className?: string
  children: React.ReactNode
  banners?: Media[]
}

export default function AppPage({
  children,
  className,
  banners,
  ...props
}: AppPageProps) {
  const pathname = usePathname()

  return (
    <main className='w-full' {...props}>
      {!!banners?.length && <AppBanners banners={banners} />}
      <div
        className={twMerge(
          'w-full py-8 px-4 mx-auto max-w-screen-xl',
          pathname !== '/' && 'pt-16',
          className
        )}
      >
        {children}
      </div>
    </main>
  )
}
