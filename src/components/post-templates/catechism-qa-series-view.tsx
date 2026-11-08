import AppMarkdown from "@/components/app-markdown";
import { CatechismQASeriesBlock } from "@/payload-types";

interface Props {
  block: CatechismQASeriesBlock;
}

export default function CatechismQASeriesView({ block }: Props) {
  const { title, introduction, items, credits } = block;

  return (
    <article className="mx-auto max-w-5xl rounded-xl bg-white px-4 py-5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] md:px-6">
      <h2 className="text-secondary mb-2 text-[22px] font-bold uppercase md:text-[28px]">
        {title}
      </h2>
      <AppMarkdown className="text-primary-800 mb-5 space-y-3 border-l-4 border-orange-500 pl-3 text-justify text-[17px] leading-relaxed md:text-xl">
        {introduction}
      </AppMarkdown>

      <div className="flex flex-col gap-3">
        {items.map((item, idx) => (
          <section
            key={item.id ?? idx}
            className="flex items-start gap-2.5 rounded-lg py-2.5 transition-colors duration-200 hover:bg-[#f8fbfb] motion-reduce:transition-none sm:gap-3.5 sm:p-3.5"
          >
            {item.icon && (
              <div
                aria-hidden="true"
                className="bg-primary-700/10 grid size-9 shrink-0 place-items-center rounded-lg text-lg sm:size-[42px] sm:text-[22px]"
              >
                {item.icon}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-[#0b2730] md:text-xl">
                {item.title}
              </h3>
              <AppMarkdown className="text-justify text-[17px] leading-[1.75] text-gray-700 md:text-[19px] [&_p]:mt-1.5">
                {item.body}
              </AppMarkdown>
            </div>
          </section>
        ))}
      </div>

      {credits && (
        <p className="mt-4 border-t border-dashed border-gray-300 pt-2 text-right text-[13px] text-gray-500 italic">
          {credits}
        </p>
      )}
    </article>
  );
}
