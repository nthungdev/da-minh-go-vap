'use client'

import NextImage from 'next/image'
import AppCarousel from '@/components/app-carousel'
import { Image } from '@/definitions'
import { twMerge } from 'tailwind-merge'

export default function AsideSectionSlideshow({
  slides,
  className,
}: {
  slides: Image[]
  className?: string
}) {
  return (
    <div
      className={twMerge('w-full aspect-[2/3] overflow-hidden', className)}
    >
      <AppCarousel>
        {slides.map((slide, index) => (
          <NextImage
            key={index}
            className="object-cover h-full w-full"
            src={slide.url}
            alt={slide.alt || ''}
            sizes="100%"
            width={0}
            height={0}
          />
        ))}
      </AppCarousel>
    </div>
  )
}
