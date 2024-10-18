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
    <div className={`w-full aspect-[4/1.2] ${className || ''}`}>
      <AppCarousel>
        {banners.map((banner, index) => (
          <div key={index} className="h-full w-full">
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
                width={0}
                height={0}
              />
            )}
          </div>
        ))}
      </AppCarousel>
    </div>
  )
}
