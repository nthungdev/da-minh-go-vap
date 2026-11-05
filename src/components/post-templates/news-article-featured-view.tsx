import Image from "next/image";
import AppMarkdown from "@/components/app-markdown";
import LightboxModal from "@/components/post-templates/shared/lightbox-modal";
import { Media, NewsArticleFeaturedBlock } from "@/payload-types";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";

interface Props {
  block: NewsArticleFeaturedBlock;
}

export default function NewsArticleFeaturedView({ block }: Props) {
  const {
    featuredImage,
    imageCaption,
    imageAlignment,
    content,
    translator,
    sourceName,
    sourceUrl,
  } = block;

  const imageMedia =
    typeof featuredImage === "object" && featuredImage !== null
      ? (featuredImage as Media)
      : null;
  const imageAlt = imageMedia?.alt || imageCaption || "Ảnh bản tin";

  const alignmentClass =
    imageAlignment === "right"
      ? "md:float-right md:ml-5 md:mb-[15px] md:max-w-[320px]"
      : imageAlignment === "center"
        ? "mb-8 md:max-w-2xl"
        : "md:float-left md:mr-5 md:mb-[15px] md:max-w-[320px]";

  return (
    <article className="font-noto-serif flow-root text-lg leading-[1.8] text-[#003f44] md:text-[1.45rem]">
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
            className="rounded-xl"
          >
            <div className="relative aspect-[3/2] w-full cursor-zoom-in overflow-hidden rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.18)]">
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
            <figcaption className="mt-1.5 text-center text-[0.9rem] leading-normal text-gray-500">
              {imageCaption}
            </figcaption>
          )}
        </figure>
      )}

      <AppMarkdown className="prose prose-p:mt-0 prose-p:mb-[15px] prose-p:text-justify font-noto-serif max-w-none text-[1em] leading-[1.8] text-[#003f44]">
        {content}
      </AppMarkdown>

      {(translator || sourceName || sourceUrl) && (
        <footer className="clear-both mt-[25px] text-right text-base italic">
          {translator && (
            <p>
              <strong>Chuyển ngữ:</strong> {translator}
            </p>
          )}
          {(sourceName || sourceUrl) && (
            <p>
              <strong>Nguồn:</strong>{" "}
              {sourceUrl ? (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-visible:ring-chill-700 rounded hover:underline focus:outline-none focus-visible:ring-2"
                >
                  {sourceName || sourceUrl}
                  <span className="sr-only"> (mở trong tab mới)</span>
                </a>
              ) : (
                sourceName
              )}
            </p>
          )}
        </footer>
      )}
    </article>
  );
}
