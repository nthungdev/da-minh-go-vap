"use client";

import type { HTMLProps, ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/utils/common";

const headerColors = ["bg-chill-4", "bg-chill-3", "bg-chill-2"];

function AppAccordionToggle({
  title,
  controlId,
  colorLevel = 0,
}: {
  title: string;
  controlId?: string;
  colorLevel?: number;
}) {
  return (
    <AccordionTrigger
      {...(controlId ? { "aria-controls": controlId } : {})}
      className={cn(
        "items-center justify-start gap-x-3 px-2 py-3 text-base font-semibold text-gray-900 transition-colors hover:bg-primary-800 hover:text-white hover:no-underline focus-visible:ring-2 focus-visible:ring-primary-800 focus-visible:outline-none **:data-[slot=accordion-trigger-icon]:order-first **:data-[slot=accordion-trigger-icon]:ml-0 **:data-[slot=accordion-trigger-icon]:text-current motion-reduce:transition-none",
        headerColors[colorLevel % headerColors.length],
      )}
    >
      {title}
    </AccordionTrigger>
  );
}

function AppAccordionContent({
  id,
  labeledById,
  body,
  children,
}: {
  id?: string;
  labeledById?: string;
  body?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <AccordionContent
      id={id}
      {...(labeledById ? { "aria-labelledby": labeledById } : {})}
      keepMounted
      className="space-y-4 p-4"
      render={(panelProps) => (
        <div
          {...panelProps}
          className={cn(
            panelProps.className,
            "text-base duration-300 motion-reduce:animate-none motion-reduce:transition-none",
          )}
        />
      )}
    >
      {body}
      {children}
    </AccordionContent>
  );
}

export interface AppAccordionItem {
  title: string;
  body?: ReactNode;
  items?: AppAccordionItem[];
}

interface AppAccordionRootProps extends HTMLProps<"div"> {
  items: AppAccordionItem[];
  alwaysOpen?: boolean;
  itemRender: (item: AppAccordionItem, index: number) => ReactNode;
}

function AppAccordionRoot({
  id,
  children,
  items,
  alwaysOpen,
  itemRender,
}: AppAccordionRootProps) {
  return (
    <Accordion id={id} className="space-y-4" multiple={alwaysOpen}>
      {items.map(itemRender)}
      {children}
    </Accordion>
  );
}

function AppAccordionItem({
  id,
  children,
}: {
  id?: string;
  children: ReactNode;
}) {
  return (
    <AccordionItem
      id={id}
      className="rounded-lg bg-primary-50 not-last:border-b-0"
    >
      {children}
    </AccordionItem>
  );
}

function defaultItemRender(alwaysOpen?: boolean, level = 0) {
  return (item: AppAccordionItem, index: number) => (
    <AppAccordionItem key={`${item.title}-${index}`}>
      <AppAccordionToggle title={item.title} colorLevel={level} />
      <AppAccordionContent body={item.body}>
        {item.items && (
          <AppAccordionRoot
            items={item.items}
            itemRender={defaultItemRender(alwaysOpen, level + 1)}
            alwaysOpen={alwaysOpen}
          />
        )}
      </AppAccordionContent>
    </AppAccordionItem>
  );
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

function AppAccordionDefault({
  id,
  items,
  alwaysOpen,
}: AppAccordionDefaultProps) {
  return (
    <AppAccordionRoot
      id={id}
      itemRender={defaultItemRender(alwaysOpen)}
      items={items}
      alwaysOpen={alwaysOpen ?? true}
    />
  );
}

export default AppAccordion;

export { AppAccordionDefault };
