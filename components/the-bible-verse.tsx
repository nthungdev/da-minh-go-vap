"use client"

import { useEffect, useState } from "react"

interface TheBibleVerseProps {
  bibleVerses: {
    verse: string
    reference: string
  }[]
}

export default function TheBibleVerse(props: TheBibleVerseProps) {
  const { bibleVerses } = props

  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === bibleVerses.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000)

    return () => clearInterval(interval)
  })

  const currentVerse = bibleVerses[currentIndex]
  const verse = currentVerse.verse
  const reference = currentVerse.reference

  return (
    // <ul className="space-y-2">
    //   {bibleVerses.map(({ verse, reference }, index) => (
    //     <li key={index}>
    //       <blockquote>
    //         <p>{verse}</p>
    //         <cite className="block w-full text-right">
    //           {reference}
    //         </cite>
    //       </blockquote>
    //     </li>
    //   ))}
    // </ul>
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