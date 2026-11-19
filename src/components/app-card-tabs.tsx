"use client";

import { useState } from "react";
import { cn } from "@/utils/common";

interface AppCardTabsProps {
  tabs: {
    title: string;
    body: React.ReactNode;
  }[];
}

export default function AppCardTabs({ tabs }: AppCardTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  const activeBody = tabs[activeTab]?.body;

  return (
    <div>
      <div className="dark:border-neutral-700">
        <nav className="flex gap-x-2">
          {tabs.map(({ title }, index) => (
            <button
              key={index}
              className={cn(
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
        {activeBody}
      </div>
    </div>
  );
}
