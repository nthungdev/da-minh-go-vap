import AppMarkdown from "@/components/app-markdown";
import { GospelReflectionSplitBlock } from "@/payload-types";
import { cn } from "@/utils/common";

interface Props {
  block: GospelReflectionSplitBlock;
}

const PLAIN_BLOCKQUOTE =
  "prose-blockquote:m-0 prose-blockquote:border-s-0 prose-blockquote:p-0 prose-blockquote:ps-0 prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-inherit [&_blockquote_p]:before:content-none [&_blockquote_p]:after:content-none";

export default function GospelReflectionSplitView({ block }: Props) {
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
    <article className="rounded-[18px] border border-[#008596]/12 bg-gradient-to-b from-white to-[#fbfbfe] p-4 font-[system-ui,-apple-system,'Segoe_UI',Roboto,Arial,sans-serif] text-[clamp(16px,1.1vw,19px)] leading-[1.7] text-slate-900 shadow-[0_6px_20px_rgba(18,25,40,0.08)] sm:p-6">
      <header className="mb-3 flex flex-wrap items-center gap-3">
        <span className="text-chill-800 rounded-lg bg-[#008596]/10 px-3 py-1.5 text-[0.9em] font-semibold">
          {liturgyDate}
        </span>
        <span className="text-[0.9em] text-gray-500">{liturgyWeek}</span>
      </header>

      <h2 className="mt-2 mb-4 text-[1.5em] leading-tight font-bold text-orange-600">
        Suy Niệm Lời Chúa
      </h2>

      <div className="grid gap-5 min-[900px]:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0">
          {keyVerse && (
            <p className="my-[0.7em] text-justify italic">{keyVerse}</p>
          )}

          <AppMarkdown className="prose prose-p:my-[0.7em] prose-p:text-justify max-w-none text-[1em] leading-[1.7] text-slate-900">
            {reflection}
          </AppMarkdown>

          {prayer && (
            <AppMarkdown className="prose prose-p:my-0 prose-p:text-justify mt-[18px] max-w-none rounded-lg border-l-4 border-[#008596]/25 bg-[#008596]/6 px-4 py-3.5 text-[1em] leading-[1.7] text-slate-900 italic">
              {prayer}
            </AppMarkdown>
          )}
        </section>

        <aside
          aria-label="Tin Mừng hôm nay"
          className="relative order-first rounded-[14px] bg-gradient-to-b from-white to-[#e6f9f9] py-4 pr-4 pl-5 shadow-[0_4px_14px_rgba(0,133,150,0.08)] before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded before:bg-gradient-to-b before:from-[#008596] before:to-[#32c7c7] min-[900px]:order-none"
        >
          <div className="min-[900px]:sticky min-[900px]:top-24">
            <h3 className="mb-2 text-[1.05em] font-bold text-orange-700">
              Tin Mừng ({gospel.passage})
            </h3>

            <AppMarkdown
              className={cn(
                "prose prose-p:my-[0.5em] prose-p:text-justify max-w-none text-[0.95em] leading-[1.7] text-slate-900",
                PLAIN_BLOCKQUOTE,
              )}
            >
              {gospel.reading}
            </AppMarkdown>

            {gospel.translationCredit && (
              <p className="mt-2 text-[0.85em] text-gray-500">
                *{gospel.translationCredit}
              </p>
            )}
          </div>
        </aside>
      </div>

      {(author || productionUnit) && (
        <footer className="mt-5 text-[0.9em] text-gray-500">
          {author && (
            <p>
              <strong className="text-gray-600">Bài suy niệm:</strong> {author}
            </p>
          )}
          {productionUnit && (
            <p>
              <strong className="text-gray-600">Thực hiện:</strong>{" "}
              {productionUnit}
            </p>
          )}
        </footer>
      )}
    </article>
  );
}
