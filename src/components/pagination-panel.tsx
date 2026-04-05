import { HTMLAttributes } from "react";
import { IoIosSkipBackward, IoIosSkipForward } from "react-icons/io";
import {
  MdOutlineArrowBackIosNew,
  MdOutlineArrowForwardIos,
} from "react-icons/md";
import { twMerge } from "tailwind-merge";

interface PaginationPanelProps extends HTMLAttributes<HTMLDivElement> {
  totalPages: number;
  page: number;
  onPageChange?: (page: number) => void;
}

export default function PaginationPanel({
  totalPages,
  page,
  className,
  onPageChange,
}: PaginationPanelProps) {
  const allPages = Array(totalPages)
    .fill(null)
    .map((_, index) => index + 1);
  const shownPages = allPages.slice(Math.max(page - 3, 0), page + 2);

  return (
    <div className={twMerge("flex flex-row justify-center gap-x-1", className)}>
      <button
        className="text-primary rounded-md border px-3 py-1 hover:cursor-pointer disabled:text-black disabled:hover:cursor-auto"
        onClick={() => onPageChange?.(page - 1)}
        disabled={page <= 1}
      >
        <MdOutlineArrowBackIosNew />
      </button>
      <button
        className="text-primary rounded-md border px-3 py-1 hover:cursor-pointer disabled:text-black disabled:hover:cursor-auto"
        disabled={page <= 1}
        onClick={() => onPageChange?.(1)}
      >
        <IoIosSkipBackward />
      </button>
      {shownPages.map((p) => (
        <button
          key={p}
          className={
            "text-primary rounded-md border px-3 py-1 hover:cursor-pointer disabled:text-black disabled:hover:cursor-auto"
          }
          disabled={p === page}
          onClick={() => onPageChange?.(p)}
        >
          {p}
        </button>
      ))}
      <button
        className="text-primary rounded-md border px-3 py-1 hover:cursor-pointer disabled:text-black disabled:hover:cursor-auto"
        disabled={page >= totalPages}
        onClick={() => onPageChange?.(totalPages)}
      >
        <IoIosSkipForward />
      </button>
      <button
        className="text-primary rounded-md border px-3 py-1 hover:cursor-pointer disabled:text-black disabled:hover:cursor-auto"
        onClick={() => onPageChange?.(page + 1)}
        disabled={page >= totalPages}
      >
        <MdOutlineArrowForwardIos />
      </button>
    </div>
  );
}
