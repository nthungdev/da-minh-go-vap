"use client";

import { useState } from "react";
import AppMarkdown from "./app-markdown";
import { twMerge } from "tailwind-merge";

interface AppCardTabsProps {
  tabs: {
    title: string;
    body: string | React.ReactNode;
  }[];
}

export default function AppCardTabs({ tabs }: AppCardTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  const activeBody = tabs[activeTab]?.body;
  const isReactNode = typeof activeBody === "object";

  return (
    <div>
      <div className="dark:border-neutral-700">
        <nav className="flex gap-x-2">
          {tabs.map(({ title }, index) => (
            <button
              key={index}
              className={twMerge(
                "-mb-px inline-flex items-center gap-2 rounded-t-lg border px-4 py-3 text-center text-sm font-medium hover:cursor-pointer focus:outline-hidden",
                index === activeTab
                  ? "bg-primary border-b-transparent text-gray-50 dark:border-neutral-700 dark:border-b-gray-800 dark:bg-neutral-800"
                  : "border-neutral-300 bg-gray-50 text-gray-500 hover:text-gray-700 focus:text-gray-700 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300 dark:focus:text-neutral-300",
              )}
              onClick={() => setActiveTab(index)}
            >
              {title}
            </button>
          ))}
        </nav>
      </div>
      <div className="bg-primary-50 relative rounded-tr-lg rounded-b-lg border border-gray-200 p-4 dark:border-neutral-700">
        {activeBody === undefined ? null : isReactNode ? (
          activeBody
        ) : (
          <AppMarkdown>{activeBody as string}</AppMarkdown>
        )}
      </div>
    </div>
  );
}
