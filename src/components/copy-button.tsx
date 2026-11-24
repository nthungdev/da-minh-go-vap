"use client";

import { AlertCircle, Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { type HTMLAttributes, useEffect, useRef, useState } from "react";
import { cn } from "@/utils/common";

/** In milliseconds */
const RESET_AFTER_TIMEOUT = 1000;

type CopyState = "idle" | "copying" | "copied" | "error";

interface CopyButtonProps extends HTMLAttributes<HTMLButtonElement> {
  text: string;
}

export default function CopyButton({ className, text }: CopyButtonProps) {
  const t = useTranslations("shareToolbar");
  const [state, setState] = useState<CopyState>("idle");
  const pending = useRef(false);
  const generation = useRef(0);
  const isCopied = state === "copied";
  const label = t(
    state === "error" ? "copyFailed" : isCopied ? "copied" : "copyLink",
  );

  useEffect(
    () => () => {
      generation.current += 1;
    },
    [],
  );

  useEffect(() => {
    if (state !== "copied") return;
    const timer = setTimeout(() => setState("idle"), RESET_AFTER_TIMEOUT);
    return () => clearTimeout(timer);
  }, [state]);

  const handleCopy = async () => {
    if (pending.current || isCopied) return;
    pending.current = true;
    const id = generation.current;
    setState("copying");
    try {
      await navigator.clipboard.writeText(text);
      if (id === generation.current) setState("copied");
    } catch {
      if (id === generation.current) setState("error");
    } finally {
      pending.current = false;
    }
  };

  return (
    <button
      type="button"
      aria-busy={state === "copying"}
      aria-label={label}
      title={label}
      className={cn(className, isCopied && "pointer-events-none")}
      onClick={handleCopy}
    >
      {isCopied ? (
        <Check className="size-4" aria-hidden="true" />
      ) : state === "error" ? (
        <AlertCircle className="size-4 text-red-500" aria-hidden="true" />
      ) : (
        <Copy className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}
