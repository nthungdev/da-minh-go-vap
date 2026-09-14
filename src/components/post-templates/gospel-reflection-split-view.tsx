import AppMarkdown from "@/components/app-markdown";
import { GospelReflectionSplitBlock } from "@/payload-types";
import { BookOpen } from "lucide-react";

interface Props {
  block: GospelReflectionSplitBlock;
}

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
    <article className="mx-auto max-w-6xl">
      {/* Liturgical meta header */}
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 pb-4 text-sm text-gray-600">
        <span className="bg-primary-50 text-primary-700 rounded-full px-3 py-1 font-semibold">
          {liturgyDate}
        </span>
        <span className="text-gray-500">{liturgyWeek}</span>
      </div>

      {/* Main 2-column layout */}
      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* Left Column: Meditation & Reflection */}
        <div className="space-y-6 lg:col-span-8">
          {keyVerse && (
            <div className="border-primary-600 bg-primary-50/50 rounded-xl border-l-4 p-4 font-medium text-gray-800 italic">
              {keyVerse}
            </div>
          )}

          <AppMarkdown className="prose prose-lg max-w-none leading-relaxed text-gray-800">
            {reflection}
          </AppMarkdown>

          {prayer && (
            <div className="border-primary-200/60 from-primary-50/70 mt-8 rounded-2xl border bg-gradient-to-br to-teal-50/40 p-6 shadow-sm">
              <h3 className="text-primary-800 mb-2 text-base font-semibold">
                Lời nguyện kết
              </h3>
              <AppMarkdown className="prose prose-primary text-gray-700 italic">
                {prayer}
              </AppMarkdown>
            </div>
          )}

          {/* Author attribution */}
          {(author || productionUnit) && (
            <footer className="mt-8 space-y-1 border-t border-gray-100 pt-4 text-sm text-gray-500">
              {author && (
                <p>
                  <strong className="text-gray-700">Bài suy niệm:</strong>{" "}
                  {author}
                </p>
              )}
              {productionUnit && (
                <p>
                  <strong className="text-gray-700">Thực hiện:</strong>{" "}
                  {productionUnit}
                </p>
              )}
            </footer>
          )}
        </div>

        {/* Right Column: Sticky Gospel Reading Box */}
        <aside className="lg:col-span-4">
          <div className="border-primary-100 to-primary-50/30 sticky top-24 rounded-2xl border bg-gradient-to-b from-white p-6 shadow-sm">
            <div className="border-primary-100 text-primary-800 flex items-center gap-2 border-b pb-3">
              <BookOpen className="text-primary-600 size-5 shrink-0" />
              <h2 className="text-lg font-bold">Tin Mừng ({gospel.passage})</h2>
            </div>

            <div className="prose prose-sm mt-4 max-w-none leading-relaxed text-gray-700">
              <AppMarkdown>{gospel.reading}</AppMarkdown>
            </div>

            {gospel.translationCredit && (
              <p className="border-primary-100/60 mt-4 border-t pt-3 text-xs text-gray-400 italic">
                *{gospel.translationCredit}
              </p>
            )}
          </div>
        </aside>
      </div>
    </article>
  );
}
