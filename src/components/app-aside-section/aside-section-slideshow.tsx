'use client'

import NextImage from 'next/image'
import clsx from 'clsx'
import AppCarousel from '@/components/app-carousel'
import { Image } from '@/definitions'

export default function AsideSectionSlideshow({
  id,
  slides,
  className,
}: {
  id: string
  slides: Image[]
  className?: string
}) {
  return (
    <div
      className={clsx('w-full aspect-[2/3] overflow-hidden', className)}
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
