"use client";

import { usePathname } from "next/navigation";
import { HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export default function AppPageContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const pathname = usePathname();

  return (
    <div
      className={twMerge(
        "max-w-8xl mx-auto w-full px-4 py-8",
        pathname !== "/" && "pt-16",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
