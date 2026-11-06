"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";

interface LightboxModalProps {
  src: string;
  alt?: string;
  caption?: string | null;
  children: React.ReactNode;
  className?: string;
}

export default function LightboxModal({
  src,
  alt = "",
  caption,
  children,
  className,
}: LightboxModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
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

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      trigger?.focus();
    };
  }, [isOpen]);

  return (
    <>
      <div
        ref={triggerRef}
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-label={alt ? `Phóng to ảnh: ${alt}` : "Phóng to ảnh"}
        onClick={() => setIsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        className={cn(
          "focus-visible:ring-primary-500 cursor-pointer rounded-lg focus:outline-none focus-visible:ring-2",
          className,
        )}
      >
        {children}
      </div>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt || "Xem ảnh"}
          className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm duration-200 motion-reduce:animate-none"
          onClick={() => setIsOpen(false)}
        >
          <button
            ref={closeButtonRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            aria-label="Đóng xem ảnh"
            className="absolute top-4 right-4 z-10 rounded-full bg-white/20 p-2 text-white transition hover:bg-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="size-6" />
          </button>

          <div
            className="relative flex max-h-[90vh] max-w-[90vw] flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-h-[80vh] max-w-full overflow-hidden rounded-lg">
              <Image
                src={transformUrl(src, { width: "1600", quality: "90" })}
                alt={alt}
                width={1200}
                height={800}
                className="max-h-[80vh] w-auto rounded-lg object-contain shadow-2xl"
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
