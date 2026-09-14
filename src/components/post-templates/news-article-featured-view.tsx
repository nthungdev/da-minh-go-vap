import Image from "next/image";
import AppMarkdown from "@/components/app-markdown";
import LightboxModal from "@/components/post-templates/shared/lightbox-modal";
import { Media, NewsArticleFeaturedBlock } from "@/payload-types";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";
import { ExternalLink } from "lucide-react";

interface Props {
  block: NewsArticleFeaturedBlock;
}

export default function NewsArticleFeaturedView({ block }: Props) {
  const {
    featuredImage,
    imageCaption,
    imageAlignment,
    content,
    sourceName,
    sourceUrl,
  } = block;

  const imageMedia =
    typeof featuredImage === "object" && featuredImage !== null
      ? (featuredImage as Media)
      : null;

  const alignmentClass =
    imageAlignment === "right"
      ? "md:float-right md:ml-8 md:mb-6"
      : imageAlignment === "center"
        ? "mx-auto mb-8 block max-w-2xl"
        : "md:float-left md:mr-8 md:mb-6";

  return (
    <article className="mx-auto max-w-4xl">
      {/* Featured image with Lightbox */}
      {imageMedia?.url && (
        <figure
          className={cn(
            "w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-shadow hover:shadow-lg md:max-w-md",
            alignmentClass,
          )}
        >
          <LightboxModal
            src={imageMedia.url}
            alt={imageMedia.alt || imageCaption || "Ảnh bản tin"}
            caption={imageCaption}
          >
            <div className="relative aspect-[3/2] w-full overflow-hidden">
              <Image
                src={transformUrl(imageMedia.url, {
                  width: "800",
                  quality: "85",
                })}
                alt={imageMedia.alt || imageCaption || "Ảnh bản tin"}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          </LightboxModal>

          {imageCaption && (
            <figcaption className="bg-gray-50/50 p-3 text-center text-xs text-gray-500 italic md:text-sm">
              {imageCaption}
            </figcaption>
          )}
        </figure>
      )}

      {/* Article Content */}
      <div className="prose prose-lg clear-none max-w-none leading-relaxed text-gray-800">
        <AppMarkdown>{content}</AppMarkdown>
      </div>

      {/* Source Attribution */}
      {(sourceName || sourceUrl) && (
        <footer className="clear-both mt-10 border-t border-gray-100 pt-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Nguồn tin:</span>
            {sourceUrl ? (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 inline-flex items-center gap-1 hover:underline"
              >
                <span>{sourceName || sourceUrl}</span>
                <ExternalLink className="size-3.5" />
              </a>
            ) : (
              <span>{sourceName}</span>
            )}
          </div>
        </footer>
      )}
    </article>
  );
}
