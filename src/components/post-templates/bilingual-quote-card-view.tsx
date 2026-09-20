import { BilingualQuoteCardBlock } from "@/payload-types";
import { Quote } from "lucide-react";

interface Props {
  block: BilingualQuoteCardBlock;
}

export default function BilingualQuoteCardView({ block }: Props) {
  const { author, source, original, translation } = block;

  return (
    <article className="mx-auto max-w-4xl space-y-8 rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm sm:p-10">
      {/* Top Header Citation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 text-xs text-gray-500 italic sm:text-sm">
        <div>
          <span className="font-semibold text-gray-700">Tác giả: </span>
          <span>{author}</span>
        </div>
        {source && (
          <div>
            <span className="font-semibold text-gray-700">Nguồn: </span>
            <span>{source}</span>
          </div>
        )}
      </div>

      {/* 2-Column Side-by-Side Bilingual Quote Grid */}
      <div className="grid gap-6 md:grid-cols-2 md:divide-x md:divide-gray-100">
        {/* Original Column */}
        <div className="flex flex-col justify-between rounded-2xl bg-amber-50/30 p-6 md:p-8">
          <div className="space-y-4">
            <Quote className="size-8 rotate-180 text-amber-400" />
            <blockquote className="font-serif text-lg leading-relaxed text-gray-800 italic sm:text-xl">
              “{original.quote}”
            </blockquote>
          </div>
          <p className="mt-6 text-center text-xs font-semibold tracking-wider text-amber-800/80 uppercase">
            {original.caption || original.language}
          </p>
        </div>

        {/* Translation Column */}
        <div className="bg-primary-50/30 flex flex-col justify-between rounded-2xl p-6 md:p-8 md:pl-10">
          <div className="space-y-4">
            <Quote className="text-primary-400 size-8 rotate-180" />
            <blockquote className="font-serif text-lg leading-relaxed text-gray-800 italic sm:text-xl">
              “{translation.quote}”
            </blockquote>
          </div>
          <p className="text-primary-800/80 mt-6 text-center text-xs font-semibold tracking-wider uppercase">
            {translation.caption || translation.language}
          </p>
        </div>
      </div>
    </article>
  );
}
