"use client";

import { type HTMLProps, useEffect } from "react";
import { cn } from "@/utils/common";

interface AppAccordionToggle {
  title: string;
  controlId: string;
  colorLevel?: number;
}

function AppAccordionToggle(props: AppAccordionToggle) {
  const { controlId, title, colorLevel = 0 } = props;

  const colorVariants: Record<number, string> = {
    0: "bg-chill-4",
    1: "bg-chill-3",
    2: "bg-chill-2",
  };

  return (
    <button
      type="button"
      className={cn(
        "hs-accordion-toggle inline-flex w-full items-center gap-x-3 rounded-lg px-2 py-3 text-start font-semibold text-gray-800 hover:text-gray-50 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 hs-accordion-active:hover:text-gray-50",
        colorVariants[colorLevel],
        "hover:bg-primary-800 hs-accordion-active:text-gray-800",
      )}
      aria-expanded={false}
      aria-controls={controlId}
    >
      <svg
        className="block size-4 hs-accordion-active:hidden"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6"></path>
      </svg>
      <svg
        className="hidden size-4 hs-accordion-active:block"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m18 15-6-6-6 6"></path>
      </svg>
      {title}
    </button>
  );
}

interface AppAccordionContentProps {
  id: string;
  labeledById: string;
  body?: React.ReactNode;
  children?: React.ReactNode;
}

function AppAccordionContent(props: AppAccordionContentProps) {
  const { id, labeledById, body, children } = props;

  return (
    <section
      id={id}
      className="hs-accordion-content w-full overflow-hidden transition-[height] duration-300"
      aria-labelledby={labeledById}
      style={{ height: "0px" }}
    >
      <div className="space-y-4 p-4">
        {body}
        {children}
      </div>
    </section>
  );
}

export interface AppAccordionItem {
  title: string;
  body?: React.ReactNode;
  items?: {
    title: string;
    body?: React.ReactNode;
    items?: AppAccordionItem[];
  }[];
}

interface AppAccordionRootProps extends HTMLProps<"div"> {
  items: AppAccordionItem[];
  alwaysOpen?: boolean;
  itemRender: (item: AppAccordionItem, index: number) => React.ReactNode;
}

function AppAccordionRoot(props: AppAccordionRootProps) {
  const { id, children, items, alwaysOpen, itemRender } = props;

  useEffect(() => {
    async function initAccordion() {
      const { HSAccordion } = await import("preline/preline");
      HSAccordion.autoInit();
    }
    initAccordion();
  }, []);

  return (
    <div
      id={id}
      className="hs-accordion-group space-y-4"
      data-hs-accordion-always-open={alwaysOpen}
    >
      {items.map(itemRender)}
      {children}
    </div>
  );
}

interface AppAccordionItemProps {
  id: string;
  children: React.ReactNode;
}

function AppAccordionItem(props: AppAccordionItemProps) {
  const { id, children } = props;

  return (
    <div className={`hs-accordion rounded-lg bg-primary-50`} id={id}>
      {children}
    </div>
  );
}

interface AppAccordionDefaultItemProps {
  item: AppAccordionItem;
  index: number;
  alwaysOpen?: boolean;
  level: number;
}

function AppAccordionDefaultItem({
  item,
  index,
  alwaysOpen,
  level,
}: AppAccordionDefaultItemProps) {
  const loopedLevel = level % 3;

  return (
    <AppAccordion.Item id={`${item.title}-item-${index}`}>
      <AppAccordion.Toggle
        controlId={`${item.title}-content-${index}`}
        title={item.title}
        colorLevel={level}
      />
      <AppAccordion.Content
        id={`${item.title}-content-${index}`}
        labeledById={`${item.title}-item-${index}`}
        body={item.body}
      >
        {item.items && (
          <AppAccordion.Root
            items={item.items}
            itemRender={defaultItemRender(alwaysOpen, loopedLevel + 1)}
            alwaysOpen={alwaysOpen}
          />
        )}
      </AppAccordion.Content>
    </AppAccordion.Item>
  );
}

function defaultItemRender(alwaysOpen?: boolean, level: number = 0) {
  return function renderAccordionItem(item: AppAccordionItem, index: number) {
    return (
      <AppAccordionDefaultItem
        key={`${item.title}-${index}`}
        item={item}
        index={index}
        alwaysOpen={alwaysOpen}
        level={level}
      />
    );
  };
}

const AppAccordion = {
  Root: AppAccordionRoot,
  Toggle: AppAccordionToggle,
  Content: AppAccordionContent,
  Item: AppAccordionItem,
  itemRender: defaultItemRender,
};

interface AppAccordionDefaultProps {
  items: AppAccordionItem[];
  alwaysOpen?: boolean;
  id?: string;
}

function AppAccordionDefault(props: AppAccordionDefaultProps) {
  const { id, items, alwaysOpen } = props;

  return (
    <AppAccordionRoot
      id={id}
      itemRender={defaultItemRender(alwaysOpen)}
      items={items}
      alwaysOpen={true}
    />
  );
}

export default AppAccordion;

export { AppAccordionDefault };
