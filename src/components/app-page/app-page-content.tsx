"use client";

import { usePathname } from "next/navigation";
import type { HTMLAttributes } from "react";
import { cn } from "@/utils/common";

export default function AppPageContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={cn(
        "mx-auto w-full max-w-7xl scroll-mt-16 px-4 py-8 focus:outline-none",
        pathname !== "/" && "pt-16",
        className,
      )}
      {...props}
    >
      {children}
    </main>
  );
}
