'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

interface AppBannersProps {
  banners: {
    url: string
    alt?: string
  }[]
}

export default function AppBanners(props: AppBannersProps) {
  const { banners } = props
  const [bannerIndex, setBannerIndex] = useState(0)

  const banner = (banners || [])[bannerIndex]
  const isVideo = banner?.url?.includes('.mp4')
  const bannerUrl = banner?.url || ''

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (bannerIndex + 1) % banners.length
      setBannerIndex(nextIndex)
    }, 5000)

    return () => clearInterval(interval)
  }, [banners, bannerIndex])

  return (
    <div className="aspect-[4]">
      {isVideo ? (
        <video
          className="w-full h-full object-cover"
          src={bannerUrl}
          autoPlay
          loop
          muted
        />
      ) : (
        <Image
          className="w-full h-full object-cover"
          src={bannerUrl}
          alt={banner?.alt || ''}
          sizes="100%"
          width={256}
          height={144}
        />
      )}
    </div>
  )
}
