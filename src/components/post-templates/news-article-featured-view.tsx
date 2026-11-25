import Image from "next/image";
import { useTranslations } from "next-intl";
import AppMarkdown from "@/components/app-markdown";
import LightboxModal from "@/components/post-templates/shared/lightbox-modal";
import type { Media, NewsArticleFeaturedBlock } from "@/payload-types";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";
import { toSafeHttpUrl } from "@/utils/safe-url";

interface Props {
  block: NewsArticleFeaturedBlock;
}

const ALIGNMENT_CLASSES: Record<string, string> = {
  right: "md:float-right md:ml-5 md:mb-[15px] md:max-w-[320px]",
  center: "mb-8 md:max-w-2xl",
  left: "md:float-left md:mr-5 md:mb-[15px] md:max-w-[320px]",
};

function NewsArticleFooter({
  translator,
  audioReader,
  sourceName,
  sourceUrl,
}: {
  translator?: string | null;
  audioReader?: string | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
}) {
  const t = useTranslations();

  const hasFooterContent = Boolean(
    translator || audioReader || sourceName || sourceUrl,
  );
  if (!hasFooterContent) {
    return null;
  }

  return (
    <footer className="clear-both mt-6 text-right text-base text-foreground-muted italic">
      {translator && (
        <p>
          <strong className="text-foreground">
            {t("postTemplates.translator")}:
          </strong>{" "}
          {translator}
        </p>
      )}
      {audioReader && (
        <p>
          <strong className="text-foreground">
            {t("postTemplates.audioReader")}:
          </strong>{" "}
          {audioReader}
        </p>
      )}
      {(sourceName || sourceUrl) && (
        <p>
          <strong className="text-foreground">
            {t("postTemplates.source")}:
          </strong>{" "}
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {sourceName || sourceUrl}
              <span className="sr-only"> {t("common.openInNewTab")}</span>
            </a>
          ) : (
            sourceName
          )}
        </p>
      )}
    </footer>
  );
}

export default function NewsArticleFeaturedView({ block }: Props) {
  const t = useTranslations();
  const {
    featuredImage,
    imageCaption,
    imageAlignment,
    content,
    translator,
    audioReader,
    sourceName,
    sourceUrl: rawSourceUrl,
  } = block;
  const sourceUrl = toSafeHttpUrl(rawSourceUrl);

  const imageMedia =
    typeof featuredImage === "object" && featuredImage !== null
      ? (featuredImage as Media)
      : null;
  const imageAlt =
    imageMedia?.alt || imageCaption || t("postTemplates.newsImageAlt");
  const alignmentClass =
    ALIGNMENT_CLASSES[imageAlignment ?? "left"] ?? ALIGNMENT_CLASSES.left;

  return (
    <article className="flow-root font-noto-serif text-lg leading-[1.8] text-editorial-teal md:text-[1.45rem]">
      {imageMedia?.url && (
        <figure
          className={cn(
            "mx-auto mb-[15px] w-full max-w-full sm:max-w-[85%]",
            alignmentClass,
          )}
        >
          <LightboxModal
            src={imageMedia.url}
            alt={imageAlt}
            caption={imageCaption}
            width={imageMedia.width}
            height={imageMedia.height}
            className="rounded-xl"
          >
            <div className="relative aspect-[3/2] w-full cursor-zoom-in overflow-hidden rounded-xl bg-surface-muted shadow-md">
              <Image
                src={transformUrl(imageMedia.url, {
                  width: "800",
                  quality: "85",
                })}
                alt={imageAlt}
                fill
                sizes="(min-width: 768px) 320px, 100vw"
                className="object-cover transition-transform duration-200 hover:scale-[1.03] motion-reduce:transition-none motion-reduce:hover:scale-100"
              />
            </div>
          </LightboxModal>

          {imageCaption && (
            <figcaption className="mt-1.5 text-center text-sm leading-normal text-foreground-muted">
              {imageCaption}
            </figcaption>
          )}
        </figure>
      )}

      <AppMarkdown className="prose prose-p:mt-0 prose-p:mb-[15px] prose-p:text-justify max-w-none font-noto-serif text-[1em] leading-[1.8] text-editorial-teal">
        {content}
      </AppMarkdown>

      <NewsArticleFooter
        translator={translator}
        audioReader={audioReader}
        sourceName={sourceName}
        sourceUrl={sourceUrl}
      />
    </article>
  );
}
