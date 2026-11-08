import { BilingualQuoteCardBlock } from "@/payload-types";
import { cn } from "@/utils/common";
import { stripWrappingQuotes } from "@/utils/quote";

interface Props {
  block: BilingualQuoteCardBlock;
}

interface QuoteColumnProps {
  quote: string;
  caption: string;
  className?: string;
}

function QuoteColumn({ quote, caption, className }: QuoteColumnProps) {
  return (
    <figure
      className={cn(
        "flex min-w-0 flex-col justify-center p-6 md:w-1/2 md:p-8",
        className,
      )}
    >
      <blockquote className="relative rounded-md border-2 border-gray-300 bg-white px-6 py-8 text-center text-2xl leading-[1.9] text-[#004f4f] shadow-[inset_0_0_8px_rgba(0,0,0,0.05)] md:px-8 md:py-12 md:text-[1.9rem]">
        <span
          aria-hidden="true"
          className="absolute -top-6 left-2.5 text-7xl leading-[1.9] text-[#008b8b] opacity-30"
        >
          “
        </span>
        {stripWrappingQuotes(quote)}
        <span
          aria-hidden="true"
          className="absolute right-2.5 -bottom-9 text-7xl leading-[1.9] text-[#008b8b] opacity-30"
        >
          ”
        </span>
      </blockquote>
      <figcaption className="mt-4 text-center text-[0.9rem] text-gray-600">
        {caption}
      </figcaption>
    </figure>
  );
}

export default function BilingualQuoteCardView({ block }: Props) {
  const { author, source, original, translation } = block;

  return (
    <article className="font-lora w-full overflow-hidden rounded-lg border border-gray-300 bg-white text-[#2c2c2c] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <header className="border-b border-gray-300 bg-[#f9f9f7] px-6 py-4 text-right text-[0.95rem] italic">
        <p>Tác giả: {author}</p>
        {source && <p>Nguồn: {source}</p>}
      </header>

      <div className="flex flex-col md:flex-row">
        <QuoteColumn
          quote={original.quote}
          caption={original.caption || original.language}
          className="border-b border-gray-100 bg-[#fdfdfc] md:border-b-0"
        />
        <QuoteColumn
          quote={translation.quote}
          caption={translation.caption || translation.language}
          className="bg-[#fcfcfa]"
        />
      </div>
    </article>
  );
}
