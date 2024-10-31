'use client'

import Image from 'next/image'
import classNames from 'classnames'
import AppCarousel from '@/components/app-carousel'

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
      className={classNames('w-full aspect-[2/3] overflow-hidden', className)}
    >
      <AppCarousel>
        {slides.map((slide, index) => (
          <Image
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
