import AppMarkdown from "@/components/app-markdown";
import { DominicanSpiritualityBlock } from "@/payload-types";
import { stripWrappingQuotes } from "@/utils/quote";

interface Props {
  block: DominicanSpiritualityBlock;
}

const MARKDOWN_CLASS_NAME = [
  "leading-[1.8] [&_p]:mb-4 [&_p]:text-justify",
  "[&_h3]:mt-6 [&_h3]:text-[1.3rem] [&_h3]:font-bold [&_h3]:text-[#008596] lg:[&_h3]:text-[1.6rem]",
  "[&_h4]:mt-6 [&_h4]:text-[1.3rem] [&_h4]:font-bold [&_h4]:text-[#008596] lg:[&_h4]:text-[1.6rem]",
  "[&_ul]:mb-4 [&_ul]:ml-6 [&_ul]:list-none [&_ul_ul]:mb-0",
  "[&_li>p]:mb-0 [&_li>p]:text-left",
  "[&_blockquote]:my-6 [&_blockquote]:rounded-lg [&_blockquote]:border-l-4 [&_blockquote]:border-[#00a5a8] [&_blockquote]:bg-[#e8fbfb] [&_blockquote]:pl-4 [&_blockquote]:text-[#444] [&_blockquote]:italic",
].join(" ");

const HEADING_CLASS_NAME =
  "mt-8 mb-4 text-center text-2xl leading-[1.35] font-bold text-orange-600 uppercase md:text-[1.9rem]";

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
    <article className="w-full rounded-3xl bg-white p-5 text-[1.05rem] leading-[1.8] text-[#333] shadow-[0_4px_12px_rgba(0,0,0,0.08)] sm:p-8 md:text-xl lg:text-[1.375rem]">
      <header>
        <h2 className={HEADING_CLASS_NAME}>{reflectionTitle}</h2>
        {theme && <p className="mb-4 text-center italic">{theme}</p>}
      </header>

      <AppMarkdown className={MARKDOWN_CLASS_NAME}>{lead}</AppMarkdown>

      {points.map((p, idx) => (
        <section key={idx}>
          <h2 className={HEADING_CLASS_NAME}>
            {p.symbol && <span aria-hidden="true">{p.symbol} </span>}
            {p.title}
          </h2>
          <AppMarkdown className={MARKDOWN_CLASS_NAME}>{p.content}</AppMarkdown>
          {p.highlightQuote && (
            <blockquote className="my-6 rounded-lg border-l-4 border-[#00a5a8] bg-[#e8fbfb] py-2 pr-4 pl-4 text-[#444] italic">
              “{stripWrappingQuotes(p.highlightQuote)}”
            </blockquote>
          )}
        </section>
      ))}

      {closingPrayer && (
        <AppMarkdown className={MARKDOWN_CLASS_NAME}>
          {closingPrayer}
        </AppMarkdown>
      )}

      <footer className="mt-8 text-right text-[1.05rem] italic md:text-lg">
        <p>
          <strong className="font-bold">Tác giả:</strong> {author}
        </p>
        {authorAffiliation && <p>{authorAffiliation}</p>}
      </footer>
    </article>
  );
}
