'use client'

import Image from 'next/image'
import AppCarousel from '@/components/app-carousel'
import { twMerge } from 'tailwind-merge'
import { Media } from '@/payload-types'

export default function ImageSlideshow({
  slides,
  className,
}: {
  slides: Media[]
  className?: string
}) {
  return (
    <div
      className={twMerge('w-full aspect-[2/3] overflow-hidden', className)}
    >
      <AppCarousel>
        {slides
          .filter(slide => typeof slide.url === 'string')
          .map((slide, index) => (
            <Image
              key={index}
              className="object-cover h-full w-full"
              src={slide.url as string}
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
