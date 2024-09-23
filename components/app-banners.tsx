'use client'

import Image from 'next/image'
import AppCarousel from './app-carousel'

interface AppBannersProps {
  banners: {
    url: string
    alt?: string
  }[]
  className?: string
}

export default function AppBanners(props: AppBannersProps) {
  const { banners, className } = props

  const checkVideo = (url: string) => {
    const videoExtensions = ['.mp4', '.webm', '.ogg']
    return videoExtensions.some((ext) => url.includes(ext))
  }

  return (
    <div className={`aspect-[4] ${className || ''}`}>
      <AppCarousel>
        {banners.map((banner, index) => (
          <div key={index} className="h-full">
            {checkVideo(banner.url) ? (
              <video
                className="object-cover h-full w-full"
                src={banner.url}
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <Image
                className="object-cover h-full w-full"
                src={banner.url}
                alt={banner.alt || ''}
                sizes="100%"
                width={1920}
                height={1080}
              />
            )}
          </div>
        ))}
      </AppCarousel>
    </div>
  )
}
