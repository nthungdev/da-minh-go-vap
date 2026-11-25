import { useTranslations } from "next-intl";
import AppMarkdown from "@/components/app-markdown";
import type { KidsBibleStoryBlock } from "@/payload-types";
import { cn } from "@/utils/common";
import { stripWrappingQuotes } from "@/utils/quote";

interface Props {
  block: KidsBibleStoryBlock;
  isTitleHidden?: boolean;
}

const PRESENTER_SEPARATOR = /\s*(?:·|\n)\s*/;

const BLUE_SQUARE = "rounded-xs bg-linear-to-br from-info to-primary shadow-sm";

export default function KidsBibleStoryView({ block, isTitleHidden }: Props) {
  const Heading = isTitleHidden ? "h1" : "h2";
  const t = useTranslations("postTemplates");
  const {
    episodeLabel,
    title,
    subtitle,
    summaryCard,
    content,
    memoryQuote,
    credits,
  } = block;
  const takeaways = summaryCard?.takeaways ?? [];
  const presenters =
    credits?.presenter?.split(PRESENTER_SEPARATOR).filter(Boolean) ?? [];
  const hasCredits = presenters.length > 0 || Boolean(credits?.productionUnit);

  return (
    <article className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border bg-surface p-card-sm text-foreground shadow-lg sm:p-card">
      {episodeLabel && (
        <p className="inline-flex max-w-full flex-wrap items-center gap-2.5 rounded-pill border border-info-border/30 bg-info-subtle px-3.5 py-2 text-lg font-bold text-info md:text-2xl">
          <span
            aria-hidden="true"
            className={cn("size-2.5 shrink-0", BLUE_SQUARE)}
          />
          {episodeLabel}
        </p>
      )}
      <Heading
        className={cn(
          "mt-3.5 mb-2 leading-tight font-bold tracking-tight break-words",
          isTitleHidden ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
        )}
      >
        {title}
      </Heading>
      <p className="mb-3.5 text-sm text-foreground-muted">{subtitle}</p>

      <div className="rounded-xl border border-border p-card-sm text-base md:p-card md:text-xl">
        {summaryCard?.intro && (
          <AppMarkdown className="mb-2.5 space-y-3 text-justify leading-normal [&_strong]:font-bold">
            {summaryCard.intro}
          </AppMarkdown>
        )}

        {takeaways.length > 0 && (
          <ul className="grid gap-2.5">
            {takeaways.map((item, idx) => (
              <li
                key={item.id ?? idx}
                className="relative pl-7 text-justify leading-normal"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-[0.45em] left-0 size-3.5",
                    BLUE_SQUARE,
                  )}
                />
                {item.text}
              </li>
            ))}
          </ul>
        )}

        {content && (
          <AppMarkdown className="prose prose-p:text-justify prose-li:text-justify mt-4 max-w-none text-base leading-relaxed text-foreground md:text-lg">
            {content}
          </AppMarkdown>
        )}

        {memoryQuote && (
          <blockquote className="my-3.5 rounded-lg border-l-4 border-info-border bg-info-subtle px-4 py-3.5 text-info italic">
            “{stripWrappingQuotes(memoryQuote)}”
          </blockquote>
        )}

        {hasCredits && (
          <p className="mt-3 border-t border-dashed border-border pt-1.5 text-right text-xs leading-snug text-foreground-muted italic">
            {presenters.map((name, idx) => (
              <span key={name} className="block">
                {idx === 0 ? t("presenter", { name }) : name}
              </span>
            ))}
            {credits?.productionUnit && (
              <span className="block">
                {t("producer")}: {credits.productionUnit}
              </span>
            )}
          </p>
        )}
      </div>
    </article>
  );
}
