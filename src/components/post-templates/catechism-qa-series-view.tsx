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
    <article className="mx-auto max-w-5xl rounded-xl border border-border bg-surface p-card-sm shadow-md md:p-card">
      <Heading
        className={cn(
          "mb-2 font-bold text-secondary uppercase",
          isTitleHidden ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
        )}
      >
        {title}
      </Heading>
      <AppMarkdown className="mb-5 space-y-3 border-l-4 border-secondary pl-3 text-justify text-lg leading-relaxed text-primary md:text-xl">
        {introduction}
      </AppMarkdown>

      <div className="flex flex-col gap-3">
        {items.map((item, idx) => (
          <section
            key={item.id ?? idx}
            className="flex items-start gap-2.5 rounded-lg py-2.5 transition-colors duration-200 hover:bg-surface-tint motion-reduce:transition-none sm:gap-3.5 sm:p-3.5"
          >
            {item.icon && (
              <div
                aria-hidden="true"
                className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-lg text-accent-foreground sm:size-11 sm:text-xl"
              >
                {item.icon}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <SectionHeading className="text-lg font-bold text-editorial-teal-deep md:text-xl">
                {item.title}
              </SectionHeading>
              <AppMarkdown className="text-justify text-base leading-[1.75] text-foreground md:text-lg [&_p]:mt-1.5">
                {item.body}
              </AppMarkdown>
            </div>
          </section>
        ))}
      </div>

      {credits && (
        <p className="mt-4 border-t border-dashed border-border pt-2 text-right text-xs text-foreground-muted italic">
          {credits}
        </p>
      )}
    </article>
  );
}
