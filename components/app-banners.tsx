'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import AppCarousel from './app-carousel'

interface AppBannersProps {
  banners: {
    url: string
    alt?: string
  }[]
}

export default function AppBanners(props: AppBannersProps) {
  const { banners } = props
  // const [bannerIndex, setBannerIndex] = useState(0)

  // const banner = (banners || [])[bannerIndex]
  // support more video extensions
  // const isVideo = banner?.url?.includes('.mp4')
  // const bannerUrl = banner?.url || ''

  const checkVideo = (url: string) => {
    const videoExtensions = ['.mp4', '.webm', '.ogg']
    return videoExtensions.some((ext) => url.includes(ext))
  }

  // useEffect(() => {
  //   if (banners.length <= 1) return

  //   const interval = setInterval(() => {
  //     const nextIndex = (bannerIndex + 1) % banners.length
  //     setBannerIndex(nextIndex)
  //   }, 3000)

  //   return () => clearInterval(interval)
  // }, [banners, bannerIndex])

  return (
    <div className="aspect-[4]">
      <AppCarousel>
        {banners.map((banner, index) => (
          <div key={index} className="w-full h-full">
            {checkVideo(banner.url) ? (
              <video
                className="object-cover"
                src={banner.url}
                autoPlay
                loop
                muted
              />
            ) : (
              <Image
                className="object-cover"
                src={banner.url}
                alt={banner.alt || ''}
                sizes="100%"
                width={256}
                height={144}
              />
            )}
          </div>
        ))}
      </AppCarousel>
    </div>
  )
}
