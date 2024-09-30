'use client'

import { useEffect, useState } from 'react'
import QuoteOpen from '@/public/svgs/quote-open.svg'
import QuoteClose from '@/public/svgs/quote-close.svg'

interface TheBibleVerseProps {
  verses: {
    verse: string
    reference: string
  }[]
}

export default function TheBibleVerse(props: TheBibleVerseProps) {
  const { verses } = props

  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === verses.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000)

    return () => clearInterval(interval)
  })

  const currentVerse = verses[currentIndex]
  const verse = currentVerse.verse
  const reference = currentVerse.reference

  return (
    <blockquote className="relative border-2 border-primary rounded-md flex items-center justify-center py-8 px-2 bg-white">
      <QuoteOpen className="absolute top-0 start-0 size-8 text-primary" />
      <QuoteClose className="absolute bottom-0 end-0 size-8 text-primary" />

      <p className="text-center">{verse}</p>
    </blockquote>
  )
}
