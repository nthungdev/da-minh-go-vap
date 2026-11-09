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
    const initPreline = () => {
      import("preline/preline").then(() => {
        window.HSStaticMethods?.autoInit?.();
      });
    };

    if ("requestIdleCallback" in window) {
      const handle = (
        window as Window & { requestIdleCallback: (cb: () => void) => number }
      ).requestIdleCallback(initPreline);
      return () => {
        if ("cancelIdleCallback" in window) {
          (
            window as Window & { cancelIdleCallback: (id: number) => void }
          ).cancelIdleCallback(handle);
        }
      };
    } else {
      const timer = setTimeout(initPreline, 100);
      return () => clearTimeout(timer);
    }
  }, [path]);

  return null;
}
