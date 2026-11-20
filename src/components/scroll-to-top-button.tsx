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
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      aria-label={t("scrollToTop")}
      onClick={scrollToTop}
      className="text-primary-700 hover:bg-primary-700 fixed right-6 bottom-6 z-20 rounded-full bg-gray-200/50 p-3 shadow-lg transition-all hover:text-white"
    >
      <FaArrowUp className="size-4" />
    </button>
  );
}
