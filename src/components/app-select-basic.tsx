"use client";

import { ChangeEvent } from "react";

interface AppSelectBasicOption {
  value: string;
}

interface AppSelectBasicProps {
  className?: string;
  options: AppSelectBasicOption[];
  defaultValue?: string;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
}

export default function AppSelectBasic(props: AppSelectBasicProps) {
  const { className, options, defaultValue, onChange } = props;

  const data = {
    toggleTag: '<button type="button" aria-expanded="false"></button>',
    toggleClasses: `hs-select-disabled:pointer-events-none hs-select-disabled:opacity-50 relative py-3 ps-4 pe-9 flex flex-row justify-center gap-x-2 text-nowrap w-full cursor-pointer bg-white border border-gray-200 rounded-lg text-center text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500`,
    dropdownClasses:
      "mt-2 z-50 w-full max-h-72 p-1 space-y-0.5 bg-white border border-gray-200 rounded-lg overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300",
    optionClasses:
      "py-2 px-4 w-full text-center text-sm text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg focus:outline-hidden focus:bg-gray-100 hs-select-disabled:pointer-events-none hs-select-disabled:opacity-50",
    optionTemplate: `<div class="flex items-center w-full"><span class="flex-1 text-center" data-title></span><span class="hidden hs-selected:block"><svg class="shrink-0 size-3.5 text-blue-600 " xmlns="http:.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span></div>`,
    extraMarkup:
      '<div class="absolute top-1/2 end-3 -translate-y-1/2"><svg class="shrink-0 size-3.5 text-gray-500 " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg></div>',
  };

  return (
    <div className={className}>
      <select
        defaultValue={defaultValue}
        data-hs-select={JSON.stringify(data)}
        className="hidden"
        onChange={onChange}
      >
        <option value="">Choose</option>
        {options.map((option, index) => (
          <option key={index}>{option.value}</option>
        ))}
      </select>
    </div>
  );
}
