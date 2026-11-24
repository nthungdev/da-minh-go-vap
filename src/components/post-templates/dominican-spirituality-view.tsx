import { useTranslations } from "next-intl";
import AppMarkdown from "@/components/app-markdown";
import type { DominicanSpiritualityBlock } from "@/payload-types";
import { cn } from "@/utils/common";
import { stripWrappingQuotes } from "@/utils/quote";

interface Props {
  block: DominicanSpiritualityBlock;
  isTitleHidden?: boolean;
}

const MARKDOWN_CLASS_NAME = [
  "leading-[1.8] [&_p]:mb-4 [&_p]:text-justify",
  "[&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-primary-800 sm:[&_h3]:text-lg",
  "[&_h4]:mt-6 [&_h4]:text-base [&_h4]:font-bold [&_h4]:text-primary-800 sm:[&_h4]:text-lg",
  "[&_ul]:mb-4 [&_ul]:ml-6 [&_ul]:list-none [&_ul_ul]:mb-0",
  "[&_li>p]:mb-0 [&_li>p]:text-left",
  "[&_blockquote]:my-6 [&_blockquote]:rounded-lg [&_blockquote]:border-l-4 [&_blockquote]:border-callout-accent [&_blockquote]:bg-callout-bg-alt [&_blockquote]:pl-4 [&_blockquote]:text-ink-muted [&_blockquote]:italic",
].join(" ");

const HEADING_CLASS_NAME =
  "mt-8 mb-4 text-center leading-tight font-bold text-secondary-700 uppercase";

export default function DominicanSpiritualityView({
  block,
  isTitleHidden,
}: Props) {
  const Heading = isTitleHidden ? "h1" : "h2";
  const SectionHeading = isTitleHidden ? "h2" : "h3";
  const t = useTranslations("postTemplates");
  const {
    reflectionTitle,
    theme,
    lead,
    points,
    closingPrayer,
    author,
    authorAffiliation,
  } = block;

  return (
    <article className="w-full rounded-3xl bg-white p-5 text-base leading-[1.8] text-ink-strong shadow-[0_4px_12px_rgba(0,0,0,0.08)] sm:p-8 sm:text-lg">
      <header>
        <Heading
          className={cn(
            HEADING_CLASS_NAME,
            isTitleHidden ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
          )}
        >
          {reflectionTitle}
        </Heading>
        {theme && <p className="mb-4 text-center italic">{theme}</p>}
      </header>

      <AppMarkdown className={MARKDOWN_CLASS_NAME}>{lead}</AppMarkdown>

      {points.map((p) => (
        <section key={p.id ?? p.title}>
          <SectionHeading
            className={cn(HEADING_CLASS_NAME, "text-lg sm:text-xl")}
          >
            {p.symbol && <span aria-hidden="true">{p.symbol} </span>}
            {p.title}
          </SectionHeading>
          <AppMarkdown className={MARKDOWN_CLASS_NAME}>{p.content}</AppMarkdown>
          {p.highlightQuote && (
            <blockquote className="my-6 rounded-lg border-l-4 border-callout-accent bg-callout-bg-alt py-2 pr-4 pl-4 text-ink-muted italic">
              “{stripWrappingQuotes(p.highlightQuote)}”
            </blockquote>
          )}
        </section>
      ))}

      {closingPrayer && (
        <AppMarkdown className={MARKDOWN_CLASS_NAME}>
          {closingPrayer}
        </AppMarkdown>
      )}

      <footer className="mt-8 text-right text-[1.05rem] italic md:text-lg">
        <p>
          <strong className="font-bold">{t("author")}:</strong> {author}
        </p>
        {authorAffiliation && <p>{authorAffiliation}</p>}
      </footer>
    </article>
  );
}
