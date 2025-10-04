"use client";

import { useState } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { twMerge } from "tailwind-merge";

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
  const [open, setOpen] = useState(false);
  const { id, className, activeIndex, options, onChange } = props;

  async function handleToggle() {
    const dropdownElement = document.querySelector<HTMLElement>(`#${id}`);
    if (!dropdownElement) {
      console.log("dropdown not found");
      return;
    }
    const { HSDropdown } = await import("preline/preline");

    if (open) {
      setOpen(false);
      HSDropdown.close(dropdownElement);
    } else {
      setOpen(true);
      HSDropdown.open(dropdownElement);
    }
  }

  return (
    <div
      id={id}
      className={twMerge("hs-dropdown relative inline-flex", className)}
    >
      <button
        type="button"
        className="hs-dropdown-toggle inline-flex cursor-pointer items-center justify-center gap-x-2 p-1"
        aria-expanded="false"
        aria-label="Menu"
        onClick={handleToggle}
      >
        {open ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
      </button>

      <div
        className="hs-dropdown-menu duration hs-dropdown-open:opacity-100 z-10 mt-2 hidden rounded-md bg-white p-2 text-black opacity-0 shadow-2xl/20 transition-[opacity,margin]"
        role="menu"
        aria-labelledby={id}
      >
        {options.map((option, index) => (
          <li
            key={index}
            className={twMerge(
              "block cursor-pointer rounded-sm px-2 py-1 hover:bg-gray-100",
              index === activeIndex && "font-bold",
            )}
            onClick={() => onChange?.(index)}
          >
            {option.value}
          </li>
        ))}
      </div>
    </div>
  );
}
