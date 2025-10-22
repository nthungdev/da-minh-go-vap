"use client";

import { HTMLAttributes, useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import { twMerge } from "tailwind-merge";

/** In milliseconds */
const RESET_AFTER_TIMEOUT = 1000;

interface CopyButtonProps extends HTMLAttributes<HTMLButtonElement> {
  text: string;
}
export default function CopyButton({ className, text }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (isCopied) return;
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, RESET_AFTER_TIMEOUT);
  };

  return (
    <button
      className={twMerge(className, isCopied && "pointer-events-none")}
      onClick={handleCopy}
    >
      {isCopied ? (
        <FiCheck aria-label="Copied" />
      ) : (
        <FiCopy aria-label="Copy message" />
      )}
    </button>
  );
}
