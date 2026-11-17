"use client";

import { HTMLAttributes, useEffect, useRef, useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import { cn } from "@/utils/common";

/** In milliseconds */
const RESET_AFTER_TIMEOUT = 1000;

interface CopyButtonProps extends HTMLAttributes<HTMLButtonElement> {
  text: string;
}
export default function CopyButton({ className, text }: CopyButtonProps) {
  const [state, setState] = useState<"idle" | "copying" | "copied" | "error">(
    "idle",
  );
  const pending = useRef(false);
  const generation = useRef(0);
  const isCopied = state === "copied";

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
      aria-label={
        state === "error"
          ? "Copy failed. Try again"
          : isCopied
            ? "Copied"
            : "Copy message"
      }
      title={state === "error" ? "Copy failed. Try again" : undefined}
      className={cn(className, isCopied && "pointer-events-none")}
      onClick={handleCopy}
    >
      {isCopied ? (
        <FiCheck aria-hidden="true" />
      ) : (
        <FiCopy aria-hidden="true" />
      )}
    </button>
  );
}
