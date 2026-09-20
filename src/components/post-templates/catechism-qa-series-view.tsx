import AppMarkdown from "@/components/app-markdown";
import { CatechismQASeriesBlock } from "@/payload-types";
import { HelpCircle } from "lucide-react";

interface Props {
  block: CatechismQASeriesBlock;
}

export default function CatechismQASeriesView({ block }: Props) {
  const { title, introduction, items, credits } = block;

  return (
    <article className="mx-auto max-w-4xl space-y-8">
      {/* Header Banner */}
      <div className="border-primary-100 from-primary-50/70 to-primary-50/30 rounded-2xl border bg-gradient-to-br via-white p-6 shadow-sm md:p-8">
        <div className="text-primary-700 mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
          <HelpCircle className="size-4" />
          <span>Hiểu Để Yêu — Chuyên Đề Giáo Lý</span>
        </div>
        <h1 className="text-primary-950 text-2xl font-extrabold tracking-tight md:text-3xl">
          {title}
        </h1>
        <div className="prose prose-base mt-4 max-w-none leading-relaxed text-gray-700">
          <AppMarkdown>{introduction}</AppMarkdown>
        </div>
      </div>

      {/* Q&A Items */}
      <div className="space-y-6">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md md:gap-6 md:p-7"
          >
            {/* Icon / Emoji badge */}
            <div className="bg-primary-50 flex size-11 shrink-0 items-center justify-center rounded-xl text-xl shadow-inner md:size-12 md:text-2xl">
              {item.icon || "📖"}
            </div>

            {/* Content body */}
            <div className="flex-1 space-y-2">
              <h2 className="text-lg font-bold text-gray-900 md:text-xl">
                {item.title}
              </h2>
              <div className="prose prose-base max-w-none leading-relaxed text-gray-700">
                <AppMarkdown>{item.body}</AppMarkdown>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Credits */}
      {credits && (
        <footer className="border-t border-gray-100 pt-4 text-right text-sm text-gray-500 italic">
          {credits}
        </footer>
      )}
    </article>
  );
}
