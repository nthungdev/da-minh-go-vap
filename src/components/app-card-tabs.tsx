"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/utils/common";

interface AppCardTabsProps {
  tabs: {
    title: string;
    body: React.ReactNode;
  }[];
}

/** Returns the next tab index for a horizontal navigation key, including wraparound. */
export function getTabIndexForKey(key: string, index: number, count: number) {
  switch (key) {
    case "ArrowLeft":
      return (index - 1 + count) % count;
    case "ArrowRight":
      return (index + 1) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
  }
}

export default function AppCardTabs({ tabs }: AppCardTabsProps) {
  const id = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [selectedIndex, setActiveTab] = useState(0);
  if (tabs.length === 0) return null;
  const activeTab = selectedIndex < tabs.length ? selectedIndex : 0;

  return (
    <div>
      <div className="dark:border-neutral-700">
        <div
          role="tablist"
          aria-labelledby={tabs
            .map((_, index) => `${id}-tab-${index}`)
            .join(" ")}
          className="flex gap-x-2"
        >
          {tabs.map(({ title }, index) => (
            <button
              type="button"
              key={title}
              ref={(button) => {
                tabRefs.current[index] = button;
              }}
              role="tab"
              id={`${id}-tab-${index}`}
              aria-selected={index === activeTab}
              aria-controls={`${id}-panel-${index}`}
              tabIndex={index === activeTab ? 0 : -1}
              className={cn(
                "-mb-px inline-flex items-center gap-2 rounded-t-lg border px-4 py-3 text-center text-sm font-medium hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-800 focus-visible:outline-none",
                index === activeTab
                  ? "border-b-transparent bg-primary-800 text-white dark:border-neutral-700 dark:border-b-gray-800 dark:bg-neutral-800"
                  : "border-neutral-300 bg-gray-50 text-gray-500 hover:text-gray-700 focus:text-gray-700 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300 dark:focus:text-neutral-300",
              )}
              onClick={() => setActiveTab(index)}
              onKeyDown={(event) => {
                const nextIndex = getTabIndexForKey(
                  event.key,
                  index,
                  tabs.length,
                );
                if (nextIndex === undefined) return;
                event.preventDefault();
                setActiveTab(nextIndex);
                tabRefs.current[nextIndex]?.focus();
              }}
            >
              {title}
            </button>
          ))}
        </div>
      </div>
      {tabs.map(({ title, body }, index) => (
        <div
          key={title}
          id={`${id}-panel-${index}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${index}`}
          // biome-ignore lint/a11y/noNoninteractiveTabindex: Tab panels can contain text without another focus target.
          tabIndex={0}
          hidden={activeTab !== index}
          className="relative rounded-tr-lg rounded-b-lg border border-gray-200 bg-primary-50 p-4 focus-visible:ring-2 focus-visible:ring-primary-800 focus-visible:outline-none dark:border-neutral-700"
        >
          {activeTab === index && body}
        </div>
      ))}
    </div>
  );
}
