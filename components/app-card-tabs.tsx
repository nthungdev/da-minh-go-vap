'use client'

import { useState } from 'react'
import AppMarkdown from './app-markdown'

interface AppCardTabsProps {
  tabs: {
    title: string
    body: string | React.ReactNode
  }[]
}

export default function AppCardTabs({ tabs }: AppCardTabsProps) {
  const [activeTab, setActiveTab] = useState(0)

  const activeBody = tabs[activeTab].body
  const isReactNode = typeof activeBody === 'object'

  return (
    <div>
      <div className="dark:border-neutral-700">
        <nav className="flex gap-x-2">
          {tabs.map(({ title }, index) => (
            <button
              key={index}
              className={`-mb-px py-3 px-4 inline-flex items-center gap-2 text-sm font-medium text-center border rounded-t-lg focus:outline-none
                ${
                  index === activeTab
                    ? 'bg-primary border-b-transparent text-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:border-b-gray-800'
                    : 'bg-gray-50 text-gray-500 hover:text-gray-700 focus:text-gray-700 dark:bg-neutral-700 dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300 dark:focus:text-neutral-300'
                }`}
              onClick={() => setActiveTab(index)}
            >
              {title}
            </button>
          ))}
        </nav>
      </div>
      <div className="relative border border-gray-200 dark:border-neutral-700 rounded-b-lg rounded-tr-lg bg-primary-100 p-4">
        {isReactNode ? (
          activeBody
        ) : (
          <AppMarkdown>{activeBody as string}</AppMarkdown>
        )}
      </div>
    </div>
  )
}
