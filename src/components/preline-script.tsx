"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { IStaticMethods } from "preline/preline";

declare global {
  interface Window {
    HSStaticMethods: IStaticMethods;
  }
}

// Preline UI
export default function PrelineScript() {
  const path = usePathname();

  useEffect(() => {
    import("preline/preline").then(() => {
      window.HSStaticMethods.autoInit();
    });
  }, [path]);

  return null;
}
