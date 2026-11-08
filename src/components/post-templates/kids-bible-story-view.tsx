import AppMarkdown from "@/components/app-markdown";
import { KidsBibleStoryBlock } from "@/payload-types";
import { cn } from "@/utils/common";
import { stripWrappingQuotes } from "@/utils/quote";

interface Props {
  block: KidsBibleStoryBlock;
}

const PRESENTER_SEPARATOR = /\s*(?:·|\n)\s*/;

const BLUE_SQUARE =
  "rounded-[3px] bg-gradient-to-br from-blue-600 to-cyan-500 shadow-[0_6px_14px_rgba(37,99,235,0.25)]";

export default function KidsBibleStoryView({ block }: Props) {
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
    <article className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 text-gray-900 shadow-[0_14px_34px_rgba(17,24,39,0.08)] sm:p-6">
      {episodeLabel && (
        <p className="inline-flex items-center gap-2.5 rounded-full border border-blue-600/15 bg-blue-600/[0.08] px-3.5 py-2 text-lg font-bold text-blue-600 md:text-[23px]">
          <span aria-hidden="true" className={cn("size-2.5", BLUE_SQUARE)} />
          {episodeLabel}
        </p>
      )}
      <h2 className="mt-3.5 mb-2 text-[22px] leading-tight font-extrabold tracking-tight md:text-[32px]">
        {title}
      </h2>
      <p className="mb-3.5 text-[15px] text-gray-500">{subtitle}</p>

      <div className="rounded-xl border border-gray-200 p-4 text-base md:p-[18px] md:text-xl">
        {summaryCard?.intro && (
          <AppMarkdown className="mb-1 space-y-3 [&_strong]:font-bold">
            {summaryCard.intro}
          </AppMarkdown>
        )}

        {takeaways.length > 0 && (
          <ul className="grid gap-2.5">
            {takeaways.map((item, idx) => (
              <li key={item.id ?? idx} className="relative pl-7 leading-normal">
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
          <AppMarkdown className="prose mt-4 max-w-none text-base leading-relaxed text-gray-900 md:text-lg">
            {content}
          </AppMarkdown>
        )}

        {memoryQuote && (
          <blockquote className="my-3.5 rounded-lg border-l-4 border-blue-600 bg-blue-600/[0.06] px-4 py-3.5 text-gray-600 italic">
            “{stripWrappingQuotes(memoryQuote)}”
          </blockquote>
        )}

        {hasCredits && (
          <p className="mt-3 border-t border-dashed border-gray-300 pt-1.5 text-right text-[13px] leading-snug text-gray-600 italic">
            {presenters.map((name, idx) => (
              <span key={idx} className="block">
                {idx === 0 ? `Trình bày: ${name}` : name}
              </span>
            ))}
            {credits?.productionUnit && (
              <span className="block">Thực hiện: {credits.productionUnit}</span>
            )}
          </p>
        )}
      </div>
    </article>
  );
}
