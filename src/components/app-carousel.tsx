'use client'

import { Carousel } from 'flowbite-react'
import type { CarouselProps } from 'flowbite-react'

const DEFAULT_SLIDE_INTERVAL = 5000 // 5 seconds

interface AppCarouselProps extends CarouselProps {}

export default function AppCarousel(props: AppCarouselProps) {
  const { children, ...otherProps } = props

  return (
    <Carousel
      {...otherProps}
      slideInterval={props.slideInterval || DEFAULT_SLIDE_INTERVAL}
      pauseOnHover
      theme={{
        scrollContainer: {
          base: 'flex h-full snap-mandatory overflow-y-hidden overflow-x-scroll scroll-smooth rounded-none',
        },
      }}
    >
      {children}
    </Carousel>
  )
}
