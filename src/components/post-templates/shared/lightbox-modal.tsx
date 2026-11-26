"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";

export interface LightboxItem {
  src: string;
  alt?: string;
  caption?: string | null;
  /** Intrinsic size of the image; keeps the aspect ratio before it loads. */
  width?: number | null;
  height?: number | null;
}

interface LightboxModalProps extends LightboxItem {
  /** Optional list of gallery items to enable ArrowLeft/ArrowRight and prev/next navigation. */
  items?: LightboxItem[];
  /** Zero-based index of this trigger's image inside `items`. */
  initialIndex?: number;
  children: React.ReactNode;
  className?: string;
}

const modalControlClassName =
  "inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-pill bg-white/20 p-2 text-white transition-colors duration-150 hover:bg-white/35 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink/85 focus-visible:outline-none active:bg-white/50 motion-reduce:transition-none";

/** Keeps keyboard Tab focus cycling within the dialog's focusable buttons. */
function trapDialogFocus(
  event: KeyboardEvent,
  dialogEl: HTMLDivElement | null,
  fallbackEl: HTMLButtonElement | null,
) {
  const focusable = dialogEl?.querySelectorAll<HTMLElement>(
    'button:not([tabindex="-1"]):not([disabled])',
  );
  if (!focusable || focusable.length === 0) {
    event.preventDefault();
    fallbackEl?.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
}

export default function LightboxModal({
  src,
  alt = "",
  caption,
  width,
  height,
  items,
  initialIndex = 0,
  children,
  className,
}: LightboxModalProps) {
  const t = useTranslations("lightbox");
  const tCommon = useTranslations("common");
  const [isOpen, setIsOpen] = useState(false);

  const galleryItems: LightboxItem[] =
    items && items.length > 0 ? items : [{ src, alt, caption, width, height }];
  const safeInitialIndex = Math.max(
    0,
    Math.min(initialIndex, galleryItems.length - 1),
  );
  const [activeIndex, setActiveIndex] = useState(safeInitialIndex);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const itemCountRef = useRef(galleryItems.length);
  itemCountRef.current = galleryItems.length;

  const hasNavigation = galleryItems.length > 1;
  const activeItem = galleryItems[activeIndex] ?? galleryItems[0];
  const activeAlt = activeItem?.alt ?? "";

  useEffect(() => {
    if (!isOpen) return;

    const trigger = triggerRef.current;
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        return;
      }

      const itemCount = itemCountRef.current;
      if (itemCount > 1 && e.key === "ArrowLeft") {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + itemCount) % itemCount);
        return;
      }

      if (itemCount > 1 && e.key === "ArrowRight") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % itemCount);
        return;
      }

      if (e.key === "Tab") {
        trapDialogFocus(e, dialogRef.current, closeButtonRef.current);
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

  const handleOpen = () => {
    setActiveIndex(safeInitialIndex);
    setIsOpen(true);
  };

  const handlePrev = () => {
    setActiveIndex(
      (prev) => (prev - 1 + galleryItems.length) % galleryItems.length,
    );
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % galleryItems.length);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-label={alt ? t("zoomWithAlt", { alt }) : t("zoom")}
        onClick={handleOpen}
        className={cn(
          "block w-full cursor-pointer rounded-lg text-left transition-opacity duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:opacity-90 motion-reduce:transition-none",
          className,
        )}
      >
        {children}
      </button>

      {isOpen && activeItem && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={activeAlt || t("view")}
          className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-ink/85 p-4 backdrop-blur-sm duration-200 fade-in motion-reduce:animate-none"
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
            className={cn(modalControlClassName, "absolute top-4 right-4 z-20")}
          >
            <X className="size-6" aria-hidden="true" />
          </button>

          {hasNavigation && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label={tCommon("previous")}
                className={cn(
                  modalControlClassName,
                  "absolute top-1/2 left-3 z-20 -translate-y-1/2 sm:left-4",
                )}
              >
                <ChevronLeft className="size-6" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label={tCommon("next")}
                className={cn(
                  modalControlClassName,
                  "absolute top-1/2 right-3 z-20 -translate-y-1/2 sm:right-4",
                )}
              >
                <ChevronRight className="size-6" aria-hidden="true" />
              </button>
            </>
          )}

          <div className="relative z-10 flex max-h-[90vh] max-w-[90vw] flex-col items-center">
            <div className="relative max-h-[80vh] max-w-full overflow-hidden rounded-lg">
              <Image
                src={transformUrl(activeItem.src, {
                  width: "1600",
                  quality: "90",
                })}
                alt={activeAlt}
                width={activeItem.width || 1200}
                height={activeItem.height || 800}
                className="h-auto max-h-[80vh] w-auto max-w-full rounded-lg object-contain shadow-xl"
              />
            </div>
            {activeItem.caption && (
              <p className="mt-3 max-w-xl text-center text-sm text-white/90">
                {activeItem.caption}
              </p>
            )}
            {hasNavigation && (
              <p className="mt-2 text-xs font-medium text-white/80">
                {activeIndex + 1} / {galleryItems.length}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
