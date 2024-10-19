'use client'

import Image from 'next/image'
import AppCarousel from './app-carousel'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const CAROUSEL_ID = 'app-banners-carousel'
const PHOTO_DURATION = 3000 // 3 seconds

const checkVideo = (url: string) => {
  const videoExtensions = ['.mp4', '.webm', '.ogg']
  return videoExtensions.some((ext) => url.includes(ext))
}

interface AppBannersProps {
  banners: {
    url: string
    alt?: string
  }[]
  className?: string
}

export default function AppBanners(props: AppBannersProps) {
  const { banners, className } = props

  const [videosDuration, setVideosDuration] = useState<Record<number, number>>(
    {}
  )
  const [bannerIndex, setBannerIndex] = useState(0)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const nextIndex = (bannerIndex + 1) % banners.length
  const prevIndex = (bannerIndex - 1 + banners.length) % banners.length
  const duration = videosDuration[bannerIndex] || PHOTO_DURATION
  const gotAllVideosDuration =
    Object.keys(videosDuration).length ===
    banners.filter((banner) => checkVideo(banner.url)).length

  const AppBannerVideo = dynamic(
    () => import('@/components/app-banner-video'),
    { ssr: false }
  )

  const handleLoadedMetadata =
    (index: number) => (event: React.SyntheticEvent<HTMLVideoElement>) => {
      console.log(
        'video index',
        index,
        'has duration:',
        event.currentTarget.duration
      )
      setVideosDuration((prev) => ({
        ...prev,
        [index]: event.currentTarget.duration * 1000,
      }))
    }

  const getCarousel = async () => {
    const { HSCarousel } = await import('preline/preline')

    const carousel = new HSCarousel(
      document.querySelector(`#${CAROUSEL_ID}`)!,
      {
        // without passing the current index, the carousel will jump to the first slide by default
        currentIndex: bannerIndex,
      }
    )

    if (!carousel.el) {
      return null
    }

    return carousel
  }

  const timeout = async () => {
    const carousel = await getCarousel()
    if (!carousel) return

    setTimeoutId(
      setTimeout(() => {
        setBannerIndex((prev) => {
          return nextIndex
        })
        carousel.goTo(nextIndex)
      }, duration)
    )
  }

  const handleNextClick = async () => {
    if (timeoutId) clearTimeout(timeoutId)
    setBannerIndex(nextIndex)
  }

  const handlePrevClick = async () => {
    if (timeoutId) clearTimeout(timeoutId)
    setBannerIndex(prevIndex)
  }

  useEffect(() => {
    if (banners.length < 2 || !gotAllVideosDuration) return
    timeout()
  }, [gotAllVideosDuration, bannerIndex])

  return (
    <div className={`w-full aspect-[4/1.2] ${className || ''}`}>
      <AppCarousel
        id={CAROUSEL_ID}
        onNext={handleNextClick}
        onPrev={handlePrevClick}
      >
        {banners.map((banner, index) => (
          <div key={index} className="h-full w-full">
            {checkVideo(banner.url) ? (
              <AppBannerVideo
                id={`banner-video-${index}`}
                className="object-cover h-full w-full"
                src={banner.url}
                autoPlay
                crossOrigin="anonymous"
                loop
                muted
                playsInline
                preload="metadata"
                onLoadedMetadata={handleLoadedMetadata(index)}
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
