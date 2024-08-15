'use client'

import { useState } from 'react'
import AppMarkdown from './app-markdown'

interface AppAccordionProps {
  data: {
    title: string
    body: string
  }[]
}

export default function AppAccordion({ data }: AppAccordionProps) {
  const [activeIndex, setActiveIndex] = useState(-1)

  return (
    <div className="hs-accordion-group space-y-4">
      {data.map(({ title, body }, index) => (
        <div
          key={index}
          className={`hs-accordion ${index === activeIndex ? 'active' : ''}`}
          id={`hs-basic-with-arrow-heading-${index}`}
        >
          <button
            className={
              `hs-accordion-toggle hs-accordion-active:text-primary-600 py-3 inline-flex items-center gap-x-3 w-full font-semibold text-start text-gray-800 hover:text-gray-500 focus:outline-none focus:text-gray-500 rounded-lg disabled:opacity-50 disabled:pointer-events-none ${index === activeIndex ? 'dhs-accordion-toggle' : ''}`
            }
            aria-expanded={index === activeIndex}
            aria-controls={
              index === activeIndex
                ? 'hs-basic-with-arrow-collapse-one'
                : 'hs-basic-with-arrow-collapse-two'
            }
            onClick={() => setActiveIndex(index === activeIndex ? -1 : index)}
          >
            <svg
              className="hs-accordion-active:hidden block size-4"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m6 9 6 6 6-6"></path>
            </svg>
            <svg
              className="hs-accordion-active:block hidden size-4"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m18 15-6-6-6 6"></path>
            </svg>
            {title}
          </button>
          <div
            id={`hs-basic-with-arrow-collapse-${index}`}
            className={`hs-accordion-content w-full overflow-hidden transition-[height] duration-300 ${index === activeIndex ? '' : 'hidden'}`}
            role="region"
            aria-labelledby={`hs-basic-with-arrow-heading-${index}`}
          >
            <AppMarkdown>{body}</AppMarkdown>
          </div>

        </div>
      ))}
    </div>
  )
}
