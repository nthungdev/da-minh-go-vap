import { useTranslations } from "next-intl";
import type { BilingualQuoteCardBlock } from "@/payload-types";
import { cn } from "@/utils/common";
import { stripWrappingQuotes } from "@/utils/quote";

interface Props {
  block: BilingualQuoteCardBlock;
}

interface QuoteColumnProps {
  quote: string;
  caption: string;
  className?: string;
}

function QuoteColumn({ quote, caption, className }: QuoteColumnProps) {
  return (
    <figure
      className={cn(
        "flex min-w-0 flex-col justify-center p-6 md:w-1/2 md:p-8",
        className,
      )}
    >
      <blockquote className="relative rounded-lg border-2 border-border-warm bg-surface px-5 py-8 text-center text-xl leading-[1.9] [overflow-wrap:anywhere] text-editorial-quote shadow-inset sm:px-6 sm:text-2xl md:px-8 md:py-12 md:text-3xl">
        <span
          aria-hidden="true"
          className="absolute -top-6 left-2.5 text-7xl leading-[1.9] text-editorial-mark opacity-30"
        >
          “
        </span>
        {stripWrappingQuotes(quote)}
        <span
          aria-hidden="true"
          className="absolute right-2.5 -bottom-9 text-7xl leading-[1.9] text-editorial-mark opacity-30"
        >
          ”
        </span>
      </blockquote>
      <figcaption className="mt-4 text-center text-sm [overflow-wrap:anywhere] text-foreground-muted">
        {caption}
      </figcaption>
    </figure>
  );
}

export default function BilingualQuoteCardView({ block }: Props) {
  const t = useTranslations("postTemplates");
  const { author, source, original, translation } = block;

  return (
    <article className="w-full overflow-hidden rounded-xl border border-border-warm bg-surface font-lora text-ink-body shadow-sm">
      <header className="border-b border-border-warm bg-surface-header px-4 py-4 text-right text-sm [overflow-wrap:anywhere] italic sm:px-6">
        <p>
          {t("author")}: {author}
        </p>
        {source && (
          <p>
            {t("source")}: {source}
          </p>
        )}
      </header>

      <div className="flex flex-col md:flex-row">
        <QuoteColumn
          quote={original.quote}
          caption={original.caption || original.language}
          className="border-b border-border-subtle bg-surface-paper-alt md:border-b-0"
        />
        <QuoteColumn
          quote={translation.quote}
          caption={translation.caption || translation.language}
          className="bg-surface-paper"
        />
      </div>
    </article>
  );
}
