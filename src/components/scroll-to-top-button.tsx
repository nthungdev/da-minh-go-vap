"use client";

import { ArrowUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function ScrollToTopButton() {
  const t = useTranslations("common");
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    toggleVisibility();
    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReduced ? "auto" : "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      aria-label={t("scrollToTop")}
      onClick={scrollToTop}
      className="fixed right-4 bottom-4 z-20 inline-flex size-11 items-center justify-center rounded-pill border border-border bg-surface-elevated/95 text-primary shadow-lg transition-colors duration-150 hover:cursor-pointer hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:bg-primary-900 active:text-primary-foreground motion-reduce:transition-none sm:right-6 sm:bottom-6"
    >
      <ArrowUp className="size-4" aria-hidden="true" />
    </button>
  );
}
