import AppMarkdown from "@/components/app-markdown";
import type { CatechismQASeriesBlock } from "@/payload-types";
import { cn } from "@/utils/common";

interface Props {
  block: CatechismQASeriesBlock;
  isTitleHidden?: boolean;
}

export default function CatechismQASeriesView({ block, isTitleHidden }: Props) {
  const Heading = isTitleHidden ? "h1" : "h2";
  const SectionHeading = isTitleHidden ? "h2" : "h3";
  const { title, introduction, items, credits } = block;

  return (
    <article className="mx-auto max-w-5xl rounded-xl bg-white px-4 py-5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] md:px-6">
      <Heading
        className={cn(
          "mb-2 font-bold text-secondary-700 uppercase",
          isTitleHidden ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
        )}
      >
        {title}
      </Heading>
      <AppMarkdown className="mb-5 space-y-3 border-l-4 border-orange-500 pl-3 text-justify text-[17px] leading-relaxed text-primary-800 md:text-xl">
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
                className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-700/10 text-lg sm:size-[42px] sm:text-[22px]"
              >
                {item.icon}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <SectionHeading className="text-lg font-bold text-[#0b2730] md:text-xl">
                {item.title}
              </SectionHeading>
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
