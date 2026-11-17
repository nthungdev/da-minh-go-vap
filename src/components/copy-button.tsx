"use client";

import { HTMLAttributes, useEffect, useState } from "react";
import { FiAlertCircle, FiCheck, FiCopy } from "react-icons/fi";
import { cn } from "@/utils/common";

/** In milliseconds */
const RESET_AFTER_TIMEOUT = 1000;

type CopyStatus = "idle" | "copied" | "error";

interface CopyButtonProps extends HTMLAttributes<HTMLButtonElement> {
  text: string;
}

export default function CopyButton({ className, text }: CopyButtonProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");

  useEffect(() => {
    if (status === "idle") return;

    const timer = setTimeout(() => {
      setStatus("idle");
    }, RESET_AFTER_TIMEOUT);

    return () => clearTimeout(timer);
  }, [status]);

  const handleCopy = async () => {
    if (status !== "idle") return;
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  };

  const label =
    status === "copied"
      ? "Copied"
      : status === "error"
        ? "Copy failed"
        : "Copy message";

  return (
    <button
      type="button"
      aria-label={label}
      className={cn(className, status !== "idle" && "pointer-events-none")}
      onClick={handleCopy}
    >
      {status === "copied" ? (
        <FiCheck aria-hidden="true" />
      ) : status === "error" ? (
        <FiAlertCircle aria-hidden="true" className="text-red-500" />
      ) : (
        <FiCopy aria-hidden="true" />
      )}
    </button>
  );
}
