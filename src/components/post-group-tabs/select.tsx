"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { cn } from "@/utils/common";

interface PostGroupTabsSelectOption {
  value: string;
}

interface PostGroupTabsSelectProps {
  id: string;
  className?: string;
  options: PostGroupTabsSelectOption[];
  activeIndex?: number;
  onChange?: (index: number) => void;
}

export default function PostGroupTabsSelect(props: PostGroupTabsSelectProps) {
  const { id, className, activeIndex, options, onChange } = props;
  const t = useTranslations("navigation");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = `${id}-menu`;

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      id={id}
      className={cn("relative inline-flex", className)}
    >
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex cursor-pointer items-center justify-center gap-x-2 p-1"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={t("menu")}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
      </button>

      {isOpen && (
        <div
          id={menuId}
          className="absolute end-0 top-full z-10 mt-2 min-w-44 rounded-md bg-white p-2 text-black shadow-2xl/20"
          role="menu"
          aria-labelledby={id}
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              role="menuitem"
              className={cn(
                "block w-full cursor-pointer rounded-sm px-2 py-1 text-left hover:bg-gray-100",
                index === activeIndex && "font-bold",
              )}
              onClick={() => {
                onChange?.(index);
                setIsOpen(false);
              }}
            >
              {option.value}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
