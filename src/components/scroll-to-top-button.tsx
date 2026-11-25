"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

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
      className="fixed right-6 bottom-6 z-20 inline-flex size-11 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-primary-800 shadow-lg transition-colors hover:bg-primary-800 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-800 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
    >
      <FaArrowUp className="size-4" aria-hidden="true" />
    </button>
  );
}
