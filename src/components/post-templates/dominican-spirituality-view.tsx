import AppMarkdown from "@/components/app-markdown";
import { DominicanSpiritualityBlock } from "@/payload-types";
import { Cross, Sparkles } from "lucide-react";

interface Props {
  block: DominicanSpiritualityBlock;
}

export default function DominicanSpiritualityView({ block }: Props) {
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
    <article className="mx-auto max-w-4xl space-y-10">
      {/* Header Banner */}
      <header className="space-y-3 rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50/70 via-white to-teal-50/30 p-6 shadow-sm md:p-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-800">
          <Cross className="size-3.5 text-teal-700" />
          <span>Linh Đạo &amp; Suy Niệm Đa Minh</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-teal-950 sm:text-3xl">
          {reflectionTitle}
        </h1>
        {theme && (
          <p className="text-base font-medium text-teal-800/80 italic sm:text-lg">
            {theme}
          </p>
        )}
      </header>

      {/* Opening Meditation Lead */}
      <div className="prose prose-lg max-w-none font-serif leading-relaxed text-gray-800">
        <AppMarkdown>{lead}</AppMarkdown>
      </div>

      {/* Reflection Points */}
      <div className="space-y-8">
        {points.map((p, idx) => (
          <section
            key={idx}
            className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8"
          >
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <span className="text-xl font-bold text-teal-600 select-none">
                {p.symbol || "❖"}
              </span>
              <h2 className="text-lg font-bold text-teal-900 md:text-xl">
                {p.title}
              </h2>
            </div>

            <div className="prose prose-lg max-w-none leading-relaxed text-gray-700">
              <AppMarkdown>{p.content}</AppMarkdown>
            </div>

            {p.highlightQuote && (
              <div className="rounded-xl border-l-4 border-teal-500 bg-teal-50/60 p-4 text-gray-800 italic">
                “{p.highlightQuote}”
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Closing Prayer */}
      {closingPrayer && (
        <section className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/80 to-emerald-50/40 p-6 shadow-sm md:p-8">
          <div className="mb-3 flex items-center gap-2 text-teal-900">
            <Sparkles className="size-5 text-teal-600" />
            <h2 className="text-lg font-bold">Lời nguyện cộng đoàn</h2>
          </div>
          <AppMarkdown className="prose prose-teal leading-relaxed text-gray-800 italic">
            {closingPrayer}
          </AppMarkdown>
        </section>
      )}

      {/* Author Footer */}
      {(author || authorAffiliation) && (
        <footer className="space-y-1 border-t border-gray-100 pt-6 text-sm text-gray-600">
          {author && (
            <p>
              <strong className="text-gray-800">Tác giả:</strong> {author}
            </p>
          )}
          {authorAffiliation && (
            <p className="text-gray-500">{authorAffiliation}</p>
          )}
        </footer>
      )}
    </article>
  );
}
