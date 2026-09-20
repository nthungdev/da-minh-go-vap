import AppMarkdown from "@/components/app-markdown";
import { KidsBibleStoryBlock } from "@/payload-types";
import { CheckCircle2, Sparkles, Star } from "lucide-react";

interface Props {
  block: KidsBibleStoryBlock;
}

export default function KidsBibleStoryView({ block }: Props) {
  const { title, subtitle, summaryCard, content, memoryQuote, credits } = block;

  return (
    <article className="mx-auto max-w-4xl space-y-8">
      {/* Friendly Header */}
      <header className="space-y-3 rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 p-6 text-center shadow-sm sm:text-left md:p-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
          <Star className="size-3.5 fill-amber-500 text-amber-500" />
          <span>Bé Và Lời — Câu Chuyện Kinh Thánh</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
          {title}
        </h1>
        <p className="text-base font-medium text-amber-900/80 sm:text-lg">
          {subtitle}
        </p>
      </header>

      {/* Summary Card with Key Takeaways */}
      {summaryCard && (
        <div className="border-primary-100 bg-primary-50/40 space-y-4 rounded-2xl border p-6 shadow-sm">
          {summaryCard.intro && (
            <p className="text-primary-900 font-semibold">
              {summaryCard.intro}
            </p>
          )}

          {summaryCard.takeaways && summaryCard.takeaways.length > 0 && (
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {summaryCard.takeaways.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <CheckCircle2 className="text-primary-600 mt-0.5 size-4 shrink-0" />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Story Content */}
      <div className="prose prose-lg max-w-none leading-relaxed text-gray-800">
        <AppMarkdown>{content}</AppMarkdown>
      </div>

      {/* Golden Memory Verse */}
      {memoryQuote && (
        <div className="space-y-2 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/60 p-6 text-center">
          <div className="inline-flex items-center gap-1 text-xs font-bold tracking-wider text-amber-800 uppercase">
            <Sparkles className="size-4 text-amber-600" />
            <span>Lời Chúa ghi nhớ</span>
          </div>
          <p className="font-serif text-lg font-bold text-amber-950 italic md:text-xl">
            {memoryQuote}
          </p>
        </div>
      )}

      {/* Production Credits */}
      {credits && (credits.presenter || credits.productionUnit) && (
        <footer className="space-y-1 border-t border-gray-100 pt-4 text-sm text-gray-500">
          {credits.presenter && (
            <p>
              <strong className="text-gray-700">Người trình bày:</strong>{" "}
              {credits.presenter}
            </p>
          )}
          {credits.productionUnit && (
            <p>
              <strong className="text-gray-700">Đơn vị thực hiện:</strong>{" "}
              {credits.productionUnit}
            </p>
          )}
        </footer>
      )}
    </article>
  );
}
