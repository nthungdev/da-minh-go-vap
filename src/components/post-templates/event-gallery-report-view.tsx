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
  "2": "md:grid-cols-2",
  "3": "md:grid-cols-3",
  "4": "grid-cols-2 md:grid-cols-4",
};

function PhotoFigure({ photo }: { photo: Photo }) {
  const media =
    typeof photo.image === "object" && photo.image !== null
      ? (photo.image as Media)
      : null;
  if (!media?.url) return null;

  const alt = media.alt || photo.caption || "Ảnh sự kiện";
  const hasDimensions = Boolean(media.width && media.height);

  return (
    <figure>
      <LightboxModal src={media.url} alt={alt} caption={photo.caption}>
        <div
          className={cn(
            "overflow-hidden rounded-lg shadow-md",
            !hasDimensions && "relative aspect-[4/3]",
          )}
        >
          <Image
            src={transformUrl(media.url, { width: "800", quality: "85" })}
            alt={alt}
            sizes="(min-width: 768px) 50vw, 100vw"
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
    <AppMarkdown className="space-y-[1.2em] text-justify text-[clamp(16px,2vw,25px)] leading-[1.6] text-black">
      {text}
    </AppMarkdown>
  );
}

export default function EventGalleryReportView({ block }: Props) {
  const { eventTitle, eventSubtitle, sections, credits } = block;

  return (
    <article className="mx-auto max-w-6xl">
      <header className="mb-8 rounded-xl border-l-4 border-blue-600 bg-slate-50 px-4 py-5 text-center shadow-[0_2px_8px_rgba(0,0,0,0.06)] md:p-6">
        <h2 className="text-secondary mb-3 text-[28px] leading-tight font-bold md:text-4xl lg:text-[42px]">
          {eventTitle}
        </h2>
        {eventSubtitle && (
          <p className="text-primary-800 text-lg leading-normal font-semibold italic md:text-2xl">
            {eventSubtitle}
          </p>
        )}
      </header>

      <div className="space-y-8 rounded-xl bg-white px-4 py-5 shadow-[0_4px_18px_rgba(0,0,0,0.08)] sm:rounded-2xl md:space-y-10 md:p-10">
        {sections.map((section, idx) => {
          const photos = section.photos ?? [];
          const sidePhoto =
            (section.layout ?? "stacked") === "stacked" ? undefined : photos[0];

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
                {section.narrative && <Narrative text={section.narrative} />}
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
                    <PhotoFigure key={photo.id ?? photoIdx} photo={photo} />
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
