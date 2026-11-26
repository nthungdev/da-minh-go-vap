import Image from "next/image";
import { useTranslations } from "next-intl";
import AppMarkdown from "@/components/app-markdown";
import LightboxModal, {
  type LightboxItem,
} from "@/components/post-templates/shared/lightbox-modal";
import type { EventGalleryReportBlock, Media } from "@/payload-types";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";

interface Props {
  block: EventGalleryReportBlock;
  isTitleHidden?: boolean;
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

function resolvePhotoMedia(photo: Photo): Media | null {
  return typeof photo.image === "object" && photo.image !== null
    ? (photo.image as Media)
    : null;
}

function PhotoFigure({
  photo,
  sizes = PHOTO_SIZES["2"],
  galleryItems,
  galleryIndex,
}: {
  photo: Photo;
  sizes?: string;
  galleryItems: LightboxItem[];
  galleryIndex: number;
}) {
  const t = useTranslations("postTemplates");
  const media = resolvePhotoMedia(photo);
  if (!media?.url) return null;

  const alt = media.alt || photo.caption || t("eventPhotoAlt");
  const hasDimensions = Boolean(media.width && media.height);

  return (
    <figure>
      <LightboxModal
        src={media.url}
        alt={alt}
        caption={photo.caption}
        width={media.width}
        height={media.height}
        items={galleryItems}
        initialIndex={galleryIndex}
      >
        <div
          className={cn(
            "overflow-hidden rounded-lg bg-surface-muted shadow-md",
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
              "w-full object-cover transition-transform duration-200 hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:hover:scale-100",
              hasDimensions && "h-auto",
            )}
          />
        </div>
      </LightboxModal>
      {photo.caption && (
        <figcaption className="mt-2 text-center text-sm text-foreground-muted italic">
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
        "prose prose-p:my-[0.6em] prose-p:text-justify prose-li:text-justify max-w-none text-[clamp(16px,2vw,25px)] leading-[1.6] text-foreground",
        "prose-headings:text-primary prose-headings:font-bold",
        "prose-a:text-primary prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-primary-900 prose-a:font-medium",
        "prose-blockquote:border-callout-border prose-blockquote:text-foreground-muted prose-blockquote:font-normal",
        "prose-ul:list-disc prose-ol:list-decimal prose-li:marker:text-primary",
      )}
    >
      {text}
    </AppMarkdown>
  );
}

function getSidePhoto(section: Section): Photo | undefined {
  const photos = section.photos ?? [];
  // A side-by-side layout needs text beside the photo; without it, stack.
  if ((section.layout ?? "stacked") === "stacked" || !section.narrative) {
    return undefined;
  }
  return photos[0];
}

/** Collects all rendered gallery photos across sections for Lightbox keyboard navigation. */
function buildGalleryIndex(sections: Section[], fallbackAlt: string) {
  const galleryItems: LightboxItem[] = [];
  const photoIndexByKey = new Map<string, number>();

  for (const [sectionIdx, section] of sections.entries()) {
    const sidePhoto = getSidePhoto(section);
    const visiblePhotos = sidePhoto ? [sidePhoto] : (section.photos ?? []);

    for (const [photoIdx, photo] of visiblePhotos.entries()) {
      const media = resolvePhotoMedia(photo);
      if (!media?.url) continue;
      const key = `${section.id ?? sectionIdx}-${photo.id ?? photoIdx}`;
      photoIndexByKey.set(key, galleryItems.length);
      galleryItems.push({
        src: media.url,
        alt: media.alt || photo.caption || fallbackAlt,
        caption: photo.caption,
        width: media.width,
        height: media.height,
      });
    }
  }

  return { galleryItems, photoIndexByKey };
}

function EventGallerySection({
  section,
  sectionIndex,
  galleryItems,
  photoIndexByKey,
}: {
  section: Section;
  sectionIndex: number;
  galleryItems: LightboxItem[];
  photoIndexByKey: Map<string, number>;
}) {
  const photos = section.photos ?? [];
  const sidePhoto = getSidePhoto(section);
  const sectionKey = section.id ?? sectionIndex;

  if (sidePhoto) {
    const sidePhotoKey = `${sectionKey}-${sidePhoto.id ?? 0}`;
    return (
      <div className="grid items-center gap-6 md:grid-cols-2 md:gap-8">
        <div
          className={cn(
            "min-w-0",
            section.layout === "imageRight" && "md:order-2",
          )}
        >
          <PhotoFigure
            photo={sidePhoto}
            galleryItems={galleryItems}
            galleryIndex={photoIndexByKey.get(sidePhotoKey) ?? 0}
          />
        </div>
        <div className="min-w-0">
          <Narrative text={section.narrative ?? ""} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {section.narrative && <Narrative text={section.narrative} />}
      {photos.length > 0 && (
        <div
          className={cn(
            "grid gap-4 sm:gap-6 md:gap-8",
            GRID_COLUMNS[section.columns],
          )}
        >
          {photos.map((photo, photoIdx) => {
            const photoKey = `${sectionKey}-${photo.id ?? photoIdx}`;
            return (
              <PhotoFigure
                key={photo.id ?? photoIdx}
                photo={photo}
                sizes={PHOTO_SIZES[section.columns]}
                galleryItems={galleryItems}
                galleryIndex={photoIndexByKey.get(photoKey) ?? 0}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function EventGalleryReportView({
  block,
  isTitleHidden,
}: Props) {
  const t = useTranslations("postTemplates");
  const Heading = isTitleHidden ? "h1" : "h2";
  const { eventTitle, eventSubtitle, sections, credits } = block;
  const { galleryItems, photoIndexByKey } = buildGalleryIndex(
    sections,
    t("eventPhotoAlt"),
  );

  return (
    <article className="mx-auto max-w-6xl">
      <header className="mb-8 text-center">
        <Heading
          className={cn(
            "leading-tight font-bold break-words text-secondary",
            isTitleHidden ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
          )}
        >
          {eventTitle}
        </Heading>
        {eventSubtitle && (
          <div className="mt-4 rounded-xl border border-border bg-surface-muted p-card-sm shadow-sm md:p-card">
            <p className="text-justify text-lg leading-normal font-semibold text-primary italic md:text-2xl">
              {eventSubtitle}
            </p>
          </div>
        )}
      </header>

      <div className="space-y-8 rounded-xl border border-border bg-surface p-card-sm shadow-md sm:rounded-2xl md:space-y-10 md:p-10">
        {sections.map((section, idx) => (
          <EventGallerySection
            key={section.id ?? idx}
            section={section}
            sectionIndex={idx}
            galleryItems={galleryItems}
            photoIndexByKey={photoIndexByKey}
          />
        ))}
      </div>

      {credits && (
        <p className="mt-5 text-center text-sm text-foreground-muted italic">
          {credits}
        </p>
      )}
    </article>
  );
}
