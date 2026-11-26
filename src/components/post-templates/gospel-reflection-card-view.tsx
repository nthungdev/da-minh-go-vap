import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import AppMarkdown from "@/components/app-markdown";
import SpotifyEmbed from "@/components/post-templates/shared/spotify-embed";
import type { GospelReflectionCardBlock, Media } from "@/payload-types";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";

interface Props {
  block: GospelReflectionCardBlock;
  isTitleHidden?: boolean;
}

export default function GospelReflectionCardView({
  block,
  isTitleHidden,
}: Props) {
  const Heading = isTitleHidden ? "h1" : "h2";
  const t = useTranslations("postTemplates");
  const {
    liturgyMeta,
    headline,
    image,
    imageCaption,
    spotifyUrl,
    gospel,
    body,
    author,
    audioReader,
  } = block;
  const imageMedia =
    typeof image === "object" && image !== null ? (image as Media) : null;
  const gospelLabel = gospel?.reference
    ? t("viewGospelWithReference", { reference: gospel.reference })
    : t("viewGospel");

  return (
    <article className="rounded-2xl border border-border bg-linear-to-b from-surface to-surface-subtle p-card-sm text-base text-foreground shadow-md sm:p-card sm:text-lg">
      <div className="relative mb-2.5 flex flex-wrap items-center gap-3.5 empty:hidden">
        {liturgyMeta && (
          <span className="rounded-lg bg-accent px-3 py-2 text-sm leading-snug font-semibold text-accent-foreground">
            {liturgyMeta}
          </span>
        )}

        {gospel?.content && (
          <details className="group text-sm">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-sm font-semibold text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
              <span>{gospelLabel}</span>
              <ChevronDown
                aria-hidden="true"
                className="size-[1em] transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
              />
            </summary>
            <div className="fixed inset-x-[5%] bottom-[10%] z-30 max-h-[60vh] overflow-y-auto rounded-xl border border-border bg-surface-elevated p-card-sm text-sm shadow-lg sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-0 sm:mt-2 sm:max-h-none sm:w-[min(480px,92vw)] sm:overflow-visible">
              <AppMarkdown className="prose prose-p:my-0 prose-p:text-justify prose-blockquote:m-0 prose-blockquote:border-s-0 prose-blockquote:p-0 prose-blockquote:ps-0 prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-inherit max-w-none text-[1em] leading-[1.68] text-foreground [&_blockquote_p]:before:content-none [&_blockquote_p]:after:content-none">
                {gospel.content}
              </AppMarkdown>
            </div>
          </details>
        )}
      </div>

      <SpotifyEmbed url={spotifyUrl} />

      {headline && (
        <Heading
          className={cn(
            "mt-1.5 mb-3.5 text-center leading-tight font-bold text-secondary",
            isTitleHidden ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
          )}
        >
          {headline}
        </Heading>
      )}

      <div className="flow-root text-[0.98em] leading-[1.68]">
        {imageMedia?.url && (
          <figure className="mb-5 max-w-full md:float-left md:mr-5 md:mb-4 md:w-[40%]">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-surface-muted">
              <Image
                src={transformUrl(imageMedia.url, {
                  width: "800",
                  quality: "85",
                })}
                alt={imageMedia.alt || headline || t("reflectionImageAlt")}
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
            {imageCaption && (
              <figcaption className="mt-2 text-center text-sm text-foreground-muted italic">
                {imageCaption}
              </figcaption>
            )}
          </figure>
        )}

        <AppMarkdown className="prose prose-p:my-2.5 prose-p:text-justify prose-li:text-justify max-w-none text-[1em] leading-[1.68] text-ink">
          {body}
        </AppMarkdown>
      </div>

      {(author || audioReader) && (
        <div className="mt-4 text-right text-sm leading-relaxed text-foreground-muted">
          {author && (
            <p>
              <strong className="text-foreground">{t("author")}:</strong>{" "}
              {author}
            </p>
          )}
          {audioReader && (
            <p>
              <strong className="text-foreground">{t("audioReader")}:</strong>{" "}
              {audioReader}
            </p>
          )}
        </div>
      )}

      <div
        aria-hidden="true"
        className="mt-4 h-1.5 rounded-md bg-linear-to-r from-primary to-editorial-grad-end"
      />
    </article>
  );
}
