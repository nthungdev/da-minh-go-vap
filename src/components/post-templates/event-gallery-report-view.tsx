import Image from "next/image";
import AppMarkdown from "@/components/app-markdown";
import LightboxModal from "@/components/post-templates/shared/lightbox-modal";
import { EventGalleryReportBlock, Media } from "@/payload-types";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";

interface Props {
  block: EventGalleryReportBlock;
}

type Section = EventGalleryReportBlock["sections"][number];
type Photo = NonNullable<Section["photos"]>[number];

const GRID_COLUMNS: Record<Section["columns"], string> = {
  "1": "grid-cols-1",
  "2": "md:grid-cols-2",
  "3": "md:grid-cols-3",
  "4": "grid-cols-2 md:grid-cols-4",
};

/** Responsive `sizes` hint per column count so single-column photos load at full width. */
const PHOTO_SIZES: Record<Section["columns"], string> = {
  "1": "(min-width: 1152px) 1100px, 100vw",
  "2": "(min-width: 768px) 50vw, 100vw",
  "3": "(min-width: 768px) 33vw, 100vw",
  "4": "(min-width: 768px) 25vw, 50vw",
};

function PhotoFigure({
  photo,
  sizes = PHOTO_SIZES["2"],
}: {
  photo: Photo;
  sizes?: string;
}) {
  const media =
    typeof photo.image === "object" && photo.image !== null
      ? (photo.image as Media)
      : null;
  if (!media?.url) return null;

  const alt = media.alt || photo.caption || "Ảnh sự kiện";
  const hasDimensions = Boolean(media.width && media.height);

  return (
    <figure>
      <LightboxModal
        src={media.url}
        alt={alt}
        caption={photo.caption}
        width={media.width}
        height={media.height}
      >
        <div
          className={cn(
            "overflow-hidden rounded-lg shadow-md",
            !hasDimensions && "relative aspect-[4/3]",
          )}
        >
          <Image
            src={transformUrl(media.url, { width: "800", quality: "85" })}
            alt={alt}
            sizes={sizes}
            {...(hasDimensions
              ? { width: media.width ?? 0, height: media.height ?? 0 }
              : { fill: true })}
            className={cn(
              "w-full object-cover transition-transform duration-200 hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100",
              hasDimensions && "h-auto",
            )}
          />
        </div>
      </LightboxModal>
      {photo.caption && (
        <figcaption className="mt-2 text-center text-sm text-gray-500 italic">
          {photo.caption}
        </figcaption>
      )}
    </figure>
  );
}

function Narrative({ text }: { text: string }) {
  return (
    <AppMarkdown
      className={cn(
        "prose prose-p:my-[0.6em] prose-p:text-justify prose-li:text-justify max-w-none text-[clamp(16px,2vw,25px)] leading-[1.6] text-black",
        "prose-headings:text-primary-800 prose-headings:font-bold",
        "prose-a:text-primary-700 prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-primary-900 prose-a:font-medium",
        "prose-blockquote:border-primary-600 prose-blockquote:text-slate-700 prose-blockquote:font-normal",
        "prose-ul:list-disc prose-ol:list-decimal prose-li:marker:text-primary-700",
      )}
    >
      {text}
    </AppMarkdown>
  );
}

export default function EventGalleryReportView({ block }: Props) {
  const { eventTitle, eventSubtitle, sections, credits } = block;

  return (
    <article className="mx-auto max-w-6xl">
      <header className="mb-8 text-center">
        <h2 className="text-secondary text-[28px] leading-tight font-bold md:text-4xl lg:text-[42px]">
          {eventTitle}
        </h2>
        {eventSubtitle && (
          <div className="mt-4 rounded-xl bg-slate-50 px-4 py-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] md:p-6">
            <p className="text-primary-800 text-lg leading-normal font-semibold italic md:text-2xl">
              {eventSubtitle}
            </p>
          </div>
        )}
      </header>

      <div className="space-y-8 rounded-xl bg-white px-4 py-5 shadow-[0_4px_18px_rgba(0,0,0,0.08)] sm:rounded-2xl md:space-y-10 md:p-10">
        {sections.map((section, idx) => {
          const photos = section.photos ?? [];
          // A side-by-side layout needs text beside the photo; without it, stack.
          const sidePhoto =
            (section.layout ?? "stacked") === "stacked" || !section.narrative
              ? undefined
              : photos[0];

          if (sidePhoto) {
            return (
              <div
                key={section.id ?? idx}
                className="grid items-center gap-8 md:grid-cols-2"
              >
                <div
                  className={cn(
                    section.layout === "imageRight" && "md:order-2",
                  )}
                >
                  <PhotoFigure photo={sidePhoto} />
                </div>
                <Narrative text={section.narrative ?? ""} />
              </div>
            );
          }

          return (
            <div key={section.id ?? idx} className="space-y-8">
              {section.narrative && <Narrative text={section.narrative} />}
              {photos.length > 0 && (
                <div
                  className={cn("grid gap-8", GRID_COLUMNS[section.columns])}
                >
                  {photos.map((photo, photoIdx) => (
                    <PhotoFigure
                      key={photo.id ?? photoIdx}
                      photo={photo}
                      sizes={PHOTO_SIZES[section.columns]}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {credits && (
        <p className="mt-5 text-center text-sm text-gray-500 italic">
          {credits}
        </p>
      )}
    </article>
  );
}
