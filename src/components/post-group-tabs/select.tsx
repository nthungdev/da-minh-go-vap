"use client";

import { Menu } from "@base-ui/react/menu";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/utils/common";

interface PostGroupTabsSelectProps {
  id: string;
  className?: string;
  options: { value: string }[];
  activeIndex?: number;
  onChange?: (index: number) => void;
}

export default function PostGroupTabsSelect({
  id,
  className,
  activeIndex = 0,
  options,
  onChange,
}: PostGroupTabsSelectProps) {
  const t = useTranslations("navigation");

  return (
    <Menu.Root modal={false}>
      <Menu.Trigger
        id={id}
        className={cn(
          "group inline-flex min-h-11 items-center gap-1.5 rounded-md border border-primary-foreground/30 bg-primary-foreground/10 px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/20 focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:outline-none motion-reduce:transition-none",
          className,
        )}
        aria-labelledby={`${id}-label ${id}-value`}
      >
        <span id={`${id}-label`} className="sr-only">
          {t("selectPostGroup")}
        </span>
        <span id={`${id}-value`}>{options[activeIndex]?.value}</span>
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 transition-transform group-data-popup-open:rotate-180 motion-reduce:transition-none"
        />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          align="end"
          sideOffset={8}
          className="z-50 max-w-(--available-width) lg:hidden"
        >
          <Menu.Popup className="max-h-(--available-height) min-w-44 overflow-auto rounded-xl border border-border bg-surface-elevated p-1.5 text-foreground shadow-lg">
            <Menu.RadioGroup value={activeIndex} onValueChange={onChange}>
              {options.map((option, index) => (
                <Menu.RadioItem
                  key={option.value}
                  value={index}
                  closeOnClick
                  className="flex min-h-10 cursor-pointer items-center rounded-md px-3 py-1.5 text-start text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground motion-reduce:transition-none data-checked:font-bold"
                >
                  {option.value}
                </Menu.RadioItem>
              ))}
            </Menu.RadioGroup>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
