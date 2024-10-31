'use client'

import classNames from 'classnames'
import { useEffect, useState } from 'react'

interface TheBibleVerseProps {
  className?: string
  verses: {
    verse: string
    reference: string
  }[]
}

export default function TheBibleVerse(props: TheBibleVerseProps) {
  const { verses, className } = props

  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (verses.length === 0) return

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
    <blockquote
      className={classNames(
        'max-w-max relative border-2 border-secondary rounded-full flex flex-col items-center justify-center pt-3 pb-2 px-10 md:px-20 bg-white text-primary shadow-neon transition-shadow',
        className
      )}
    >
      <p className="text-center font-bold text-xl">{verse}</p>
      <cite className="block w-full text-right text-xs not-italic font-semibold">{reference}</cite>
    </blockquote>
  )
}
