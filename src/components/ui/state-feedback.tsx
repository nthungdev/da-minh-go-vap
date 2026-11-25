import { AlertCircle, FileText } from "lucide-react";
import Link from "next/link";
import { cn } from "@/utils/common";

const stateClassName =
  "mx-auto flex w-full max-w-lg flex-col items-center rounded-2xl border border-stone-200 bg-white px-6 py-10 text-center";
const actionClassName =
  "mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-900 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <section className={cn(stateClassName, className)}>
      <FileText aria-hidden="true" className="mb-4 size-8 text-stone-600" />
      <h2 className="text-xl font-bold text-stone-900">{title}</h2>
      {description && <p className="mt-2 text-stone-600">{description}</p>}
      {actionLabel && actionHref && (
        <Link href={actionHref} className={actionClassName}>
          {actionLabel}
        </Link>
      )}
      {actionLabel && !actionHref && onAction && (
        <button type="button" onClick={onAction} className={actionClassName}>
          {actionLabel}
        </button>
      )}
    </section>
  );
}

type ErrorStateProps = {
  title: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({
  title,
  description,
  retryLabel,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <section className={cn(stateClassName, className)}>
      <div role="alert">
        <AlertCircle
          aria-hidden="true"
          className="mx-auto mb-4 size-8 text-red-700"
        />
        <h2 className="text-xl font-bold text-stone-900">{title}</h2>
        {description && <p className="mt-2 text-stone-600">{description}</p>}
      </div>
      {retryLabel && onRetry && (
        <button type="button" onClick={onRetry} className={actionClassName}>
          {retryLabel}
        </button>
      )}
    </section>
  );
}
