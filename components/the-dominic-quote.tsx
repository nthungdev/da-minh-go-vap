"use client"

import { useEffect, useState } from "react"

interface TheDominicQuoteProps {
  quotes: {
    quote: string
  }[]
}

export default function TheDominicQuote(props: TheDominicQuoteProps) {
  const { quotes } = props

  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === quotes.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000)

    return () => clearInterval(interval)
  })

  const currentQuote = quotes[currentIndex]
  const quote = currentQuote.quote

  return (
    <div className="h-64 md:32">
      <blockquote>
        <p className="text-center font-semibold text-2xl">{quote}</p>
      </blockquote>
    </div>
  )
}