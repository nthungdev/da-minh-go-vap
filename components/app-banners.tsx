'use client'

import Image from 'next/image'
import AppCarousel from './app-carousel'

interface AppBannersProps {
  banners: {
    url: string
    alt?: string
  }[]
}

export default function AppBanners(props: AppBannersProps) {
  const { banners } = props

  const checkVideo = (url: string) => {
    const videoExtensions = ['.mp4', '.webm', '.ogg']
    return videoExtensions.some((ext) => url.includes(ext))
  }

  return (
    <div className="aspect-[4]">
      <AppCarousel>
        {banners.map((banner, index) => (
          <div key={index} className="w-full h-full">
            {checkVideo(banner.url) ? (
              <video
                className="w-full h-full object-cover"
                src={banner.url}
                autoPlay
                loop
                muted
              />
            ) : (
              <Image
                className="w-full h-full object-cover"
                src={banner.url}
                alt={banner.alt || ''}
                sizes="100%"
                fill
              />
            )}
          </div>
        ))}
      </AppCarousel>
    </div>
  )
}
