import { useTranslations } from "next-intl";
import AppMarkdown from "@/components/app-markdown";
import type { GospelReflectionSplitBlock } from "@/payload-types";
import { cn } from "@/utils/common";

interface Props {
  block: GospelReflectionSplitBlock;
  isTitleHidden?: boolean;
}

const PLAIN_BLOCKQUOTE =
  "prose-blockquote:m-0 prose-blockquote:border-s-0 prose-blockquote:p-0 prose-blockquote:ps-0 prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-inherit [&_blockquote_p]:before:content-none [&_blockquote_p]:after:content-none";

export default function GospelReflectionSplitView({
  block,
  isTitleHidden,
}: Props) {
  const Heading = isTitleHidden ? "h1" : "h2";
  const SectionHeading = isTitleHidden ? "h2" : "h3";
  const t = useTranslations("postTemplates");
  const {
    liturgyDate,
    liturgyWeek,
    keyVerse,
    reflection,
    prayer,
    gospel,
    author,
    productionUnit,
  } = block;

  return (
    <article className="rounded-2xl border border-border bg-linear-to-b from-surface to-surface-subtle p-card-sm text-[clamp(16px,1.1vw,19px)] leading-[1.7] text-foreground shadow-md sm:p-card">
      <header className="mb-3 flex flex-wrap items-center gap-3">
        <span className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground">
          {liturgyDate}
        </span>
        <span className="text-sm text-foreground-muted">{liturgyWeek}</span>
      </header>

      <Heading
        className={cn(
          "mt-2 mb-4 leading-tight font-bold break-words text-secondary",
          isTitleHidden ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
        )}
      >
        {t("gospelReflectionHeading")}
      </Heading>

      <div className="grid gap-5 min-[900px]:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0">
          {keyVerse && (
            <p className="my-[0.7em] text-justify italic">{keyVerse}</p>
          )}

          <AppMarkdown className="prose prose-p:my-[0.7em] prose-p:text-justify max-w-none text-[1em] leading-[1.7] text-foreground">
            {reflection}
          </AppMarkdown>

          {prayer && (
            <AppMarkdown className="prose prose-p:my-0 prose-p:text-justify mt-4 max-w-none rounded-lg border-l-4 border-callout-border bg-callout-bg px-4 py-3.5 text-[1em] leading-[1.7] text-callout-text italic">
              {prayer}
            </AppMarkdown>
          )}
        </section>

        <aside
          aria-label={t("gospelToday")}
          className="relative order-first min-w-0 rounded-xl border border-border-subtle bg-linear-to-b from-surface to-callout-bg-alt py-4 pr-4 pl-5 shadow-sm before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded before:bg-linear-to-b before:from-primary before:to-editorial-grad-end min-[900px]:order-none"
        >
          <div className="min-[900px]:sticky min-[900px]:top-24">
            <SectionHeading className="mb-2 text-[1.05em] font-bold text-secondary">
              {t("gospelWithPassage", { passage: gospel.passage })}
            </SectionHeading>

            <AppMarkdown
              className={cn(
                "prose prose-p:my-[0.5em] prose-p:text-justify max-w-none text-[0.95em] leading-[1.7] text-foreground",
                PLAIN_BLOCKQUOTE,
              )}
            >
              {gospel.reading}
            </AppMarkdown>

            {gospel.translationCredit && (
              <p className="mt-2 text-xs text-foreground-muted">
                *{gospel.translationCredit}
              </p>
            )}
          </div>
        </aside>
      </div>

      {(author || productionUnit) && (
        <footer className="mt-5 text-sm text-foreground-muted">
          {author && (
            <p>
              <strong className="text-foreground">
                {t("reflectionAuthor")}:
              </strong>{" "}
              {author}
            </p>
          )}
          {productionUnit && (
            <p>
              <strong className="text-foreground">{t("producer")}:</strong>{" "}
              {productionUnit}
            </p>
          )}
        </footer>
      )}
    </article>
  );
}
