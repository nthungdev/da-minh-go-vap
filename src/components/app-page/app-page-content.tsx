"use client";

import { usePathname } from "next/navigation";
import { HTMLAttributes } from "react";
import { cn } from "@/utils/common";

export default function AppPageContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-4 py-8",
        pathname !== "/" && "pt-16",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
