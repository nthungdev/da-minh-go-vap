'use client'

import { Carousel } from 'flowbite-react'
import type { CarouselProps } from 'flowbite-react'
import { Children } from 'react'

const DEFAULT_SLIDE_INTERVAL = 5000 // 5 seconds

interface AppCarouselProps extends CarouselProps {}

export default function AppCarousel(props: AppCarouselProps) {
  const { children, ...otherProps } = props

  const childrenCount = Children.count(children)
  const singleChild = childrenCount === 1

  return (
    <Carousel
      {...otherProps}
      slideInterval={props.slideInterval || DEFAULT_SLIDE_INTERVAL}
      pauseOnHover
      draggable={false}
      theme={{
        scrollContainer: {
          base: 'flex h-full snap-mandatory overflow-y-hidden overflow-x-scroll scroll-smooth rounded-none',
        },
      }}
      // Hide controls and indicators if there is only one child
      rightControl={singleChild ? <div></div> : null}
      leftControl={singleChild ? <div></div> : null}
      indicators={!singleChild}
    >
      {children}
    </Carousel>
  )
}