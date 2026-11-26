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
    <div className="w-full">
      <div
        role="tablist"
        aria-labelledby={tabs.map((_, index) => `${id}-tab-${index}`).join(" ")}
        className="flex flex-wrap gap-x-2 gap-y-1.5"
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
              "-mb-px inline-flex min-h-11 items-center gap-2 rounded-t-lg border px-4 py-2.5 text-center text-sm font-semibold transition-colors hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none",
              index === activeTab
                ? "border-primary border-b-transparent bg-primary text-primary-foreground"
                : "border-border bg-surface-muted text-foreground-muted hover:bg-accent hover:text-accent-foreground",
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
      {tabs.map(({ title, body }, index) => (
        <div
          key={title}
          id={`${id}-panel-${index}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${index}`}
          // biome-ignore lint/a11y/noNoninteractiveTabindex: Tab panels can contain text without another focus target.
          tabIndex={0}
          hidden={activeTab !== index}
          className="relative rounded-tr-xl rounded-b-xl border border-border bg-surface p-card-sm text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none sm:p-card"
        >
          {activeTab === index && body}
        </div>
      ))}
    </div>
  );
}
