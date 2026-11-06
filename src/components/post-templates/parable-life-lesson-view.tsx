import AppMarkdown from "@/components/app-markdown";
import { ParableLifeLessonBlock } from "@/payload-types";
import { stripWrappingQuotes } from "@/utils/quote";
import { toSafeHttpUrl } from "@/utils/safe-url";

interface Props {
  block: ParableLifeLessonBlock;
}

export default function ParableLifeLessonView({ block }: Props) {
  const { contents, translator, source } = block;
  const sourceUrl = toSafeHttpUrl(source?.url);

  return (
    <article className="mx-auto w-full max-w-[1052px] text-slate-600 md:py-6">
      <div className="relative overflow-hidden rounded-[22px] border border-slate-200 bg-white px-[22px] py-7 shadow-[0_8px_20px_rgba(15,23,42,0.05)] md:rounded-[28px] md:p-10 md:shadow-[0_15px_40px_rgba(15,23,42,0.06)]">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-teal-500 via-teal-400 to-teal-200"
        />

        <div className="space-y-6">
          {contents.map((item, idx) => {
            if (item.type === "scripture") {
              return (
                <figure
                  key={idx}
                  className="relative my-10 rounded-[26px] border border-teal-500/20 bg-linear-to-br from-teal-500/8 to-white px-5 pt-[34px] pb-[26px] md:px-[30px] md:py-[38px]"
                >
                  <span
                    aria-hidden="true"
                    className="absolute -top-[18px] left-7 flex size-14 items-center justify-center rounded-full bg-linear-to-br from-teal-500 to-teal-400 text-2xl shadow-[0_10px_25px_rgba(20,184,166,0.28)]"
                  >
                    ❤️
                  </span>
                  {item.verse && (
                    <blockquote className="text-center text-lg leading-[1.8] font-bold text-teal-700 md:text-[1.35rem]">
                      “{stripWrappingQuotes(item.verse)}”
                    </blockquote>
                  )}
                  {item.reference && (
                    <figcaption className="mt-[22px] text-center text-[0.92rem] font-bold tracking-[0.5px] text-teal-700 uppercase">
                      {item.reference}
                    </figcaption>
                  )}
                </figure>
              );
            }

            if (item.type === "callout") {
              return (
                <aside
                  key={idx}
                  className="mt-[30px] flex gap-1.5 rounded-2xl border-l-4 border-teal-500 bg-teal-50 px-6 py-[22px] leading-[1.9] text-teal-700"
                >
                  <span aria-hidden="true">❤️</span>
                  <AppMarkdown className="leading-[1.9] [&_p+p]:mt-4">
                    {item.content}
                  </AppMarkdown>
                </aside>
              );
            }

            return (
              <AppMarkdown
                key={idx}
                className="text-[1.06rem] leading-[1.9] hyphens-auto md:text-justify [&_p+p]:mt-6 [&_strong]:font-bold [&_strong]:text-teal-700"
              >
                {item.content}
              </AppMarkdown>
            );
          })}
        </div>

        {(translator || source?.name) && (
          <footer className="mt-10 border-t border-slate-200 pt-6 text-right text-[0.95rem] leading-[1.9] text-slate-500 italic">
            {translator && (
              <p>
                <strong className="font-bold text-teal-700">Chuyển ngữ:</strong>{" "}
                {translator}
              </p>
            )}
            {source?.name && (
              <p>
                <strong className="font-bold text-teal-700">Nguồn:</strong>{" "}
                {sourceUrl ? (
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="hover:underline"
                  >
                    {source.name}
                  </a>
                ) : (
                  source.name
                )}
              </p>
            )}
          </footer>
        )}
      </div>
    </article>
  );
}
