"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";

interface LightboxModalProps {
  src: string;
  alt?: string;
  caption?: string | null;
  /** Intrinsic size of the image; keeps the aspect ratio before it loads. */
  width?: number | null;
  height?: number | null;
  children: React.ReactNode;
  className?: string;
}

export default function LightboxModal({
  src,
  alt = "",
  caption,
  width,
  height,
  children,
  className,
}: LightboxModalProps) {
  const t = useTranslations("lightbox");
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const trigger = triggerRef.current;
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      } else if (e.key === "Tab") {
        // The close button is the only focusable control, so keep focus trapped on it.
        e.preventDefault();
        closeButtonRef.current?.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-label={alt ? t("zoomWithAlt", { alt }) : t("zoom")}
        onClick={() => setIsOpen(true)}
        className={cn(
          "block w-full cursor-pointer rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
          className,
        )}
      >
        {children}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt || t("view")}
          className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/80 p-4 backdrop-blur-sm duration-200 fade-in motion-reduce:animate-none"
        >
          <button
            type="button"
            tabIndex={-1}
            aria-label={t("close")}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-0 cursor-default"
          />

          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label={t("close")}
            className="absolute top-4 right-4 z-10 rounded-full bg-white/20 p-2 text-white transition hover:bg-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="size-6" />
          </button>

          <div className="relative z-10 flex max-h-[90vh] max-w-[90vw] flex-col items-center">
            <div className="relative max-h-[80vh] max-w-full overflow-hidden rounded-lg">
              <Image
                src={transformUrl(src, { width: "1600", quality: "90" })}
                alt={alt}
                width={width || 1200}
                height={height || 800}
                className="h-auto max-h-[80vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
              />
            </div>
            {caption && (
              <p className="mt-3 max-w-xl text-center text-sm text-gray-200">
                {caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
