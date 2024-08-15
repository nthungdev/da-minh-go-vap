"use client"

import { useEffect, useState } from "react"

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
    <div>
      <blockquote>
        <p>{verse}</p>
        <cite className="block w-full text-right">
          {reference}
        </cite>
      </blockquote>
    </div>
  )
}