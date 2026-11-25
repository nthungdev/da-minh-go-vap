import { useTranslations } from "next-intl";
import AppMarkdown from "@/components/app-markdown";
import type { ParableLifeLessonBlock } from "@/payload-types";
import { stripWrappingQuotes } from "@/utils/quote";
import { toSafeHttpUrl } from "@/utils/safe-url";

interface Props {
  block: ParableLifeLessonBlock;
}

export default function ParableLifeLessonView({ block }: Props) {
  const t = useTranslations("postTemplates");
  const { contents, translator, source } = block;
  const sourceUrl = toSafeHttpUrl(source?.url);

  return (
    <article className="mx-auto w-full max-w-[1052px] text-foreground-muted md:py-6">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-card-sm shadow-sm md:rounded-4xl md:p-10 md:shadow-md">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-callout-accent via-editorial-grad-end to-primary-2"
        />

        <div className="space-y-6">
          {contents.map((item) => {
            const itemKey =
              item.id ?? `${item.type}-${item.verse ?? item.content ?? ""}`;

            if (item.type === "scripture") {
              return (
                <figure
                  key={itemKey}
                  className="relative my-10 rounded-4xl border border-callout-border/40 bg-linear-to-br from-callout-bg-alt to-surface px-5 pt-9 pb-7 md:px-8 md:py-10"
                >
                  <span
                    aria-hidden="true"
                    className="absolute -top-4 left-7 flex size-14 items-center justify-center rounded-pill bg-linear-to-br from-callout-accent to-editorial-grad-end text-2xl shadow-md"
                  >
                    ❤️
                  </span>
                  {item.verse && (
                    <blockquote className="text-center text-lg leading-[1.8] font-bold text-primary md:text-2xl">
                      “{stripWrappingQuotes(item.verse)}”
                    </blockquote>
                  )}
                  {item.reference && (
                    <figcaption className="mt-5 text-center text-sm font-bold tracking-wide text-primary uppercase">
                      {item.reference}
                    </figcaption>
                  )}
                </figure>
              );
            }

            if (item.type === "callout") {
              return (
                <aside
                  key={itemKey}
                  className="mt-7 flex gap-1.5 rounded-2xl border-l-4 border-callout-accent bg-callout-bg-alt px-4 py-5 leading-[1.9] text-callout-text sm:px-6"
                >
                  <span aria-hidden="true" className="shrink-0">
                    ❤️
                  </span>
                  <AppMarkdown className="min-w-0 flex-1 leading-[1.9] [&_p+p]:mt-4">
                    {item.content}
                  </AppMarkdown>
                </aside>
              );
            }

            return (
              <AppMarkdown
                key={itemKey}
                className="text-base leading-[1.9] hyphens-auto text-foreground md:text-justify md:text-lg [&_p+p]:mt-6 [&_strong]:font-bold [&_strong]:text-primary"
              >
                {item.content}
              </AppMarkdown>
            );
          })}
        </div>

        {(translator || source?.name) && (
          <footer className="mt-10 border-t border-border pt-6 text-right text-sm leading-[1.9] [overflow-wrap:anywhere] text-foreground-muted italic">
            {translator && (
              <p>
                <strong className="font-bold text-primary">
                  {t("translator")}:
                </strong>{" "}
                {translator}
              </p>
            )}
            {source?.name && (
              <p>
                <strong className="font-bold text-primary">
                  {t("source")}:
                </strong>{" "}
                {sourceUrl ? (
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="rounded-sm text-primary transition-colors duration-150 hover:text-primary-900 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:text-primary-950 motion-reduce:transition-none"
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
