import Image from "next/image";
import AppMarkdown from "@/components/app-markdown";
import LightboxModal from "@/components/post-templates/shared/lightbox-modal";
import { EventGalleryReportBlock, Media } from "@/payload-types";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";

interface Props {
  block: EventGalleryReportBlock;
}

export default function EventGalleryReportView({ block }: Props) {
  const { eventTitle, eventSubtitle, sections, credits } = block;

  return (
    <article className="mx-auto max-w-5xl space-y-10">
      {/* Event Header */}
      <header className="space-y-2 border-b border-gray-100 pb-6 text-center sm:text-left">
        <h1 className="text-primary-900 text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">
          {eventTitle}
        </h1>
        {eventSubtitle && (
          <p className="text-base text-gray-600 italic sm:text-lg">
            {eventSubtitle}
          </p>
        )}
      </header>

      {/* Dynamic Sections */}
      <div className="space-y-12">
        {sections.map((sec, idx) => {
          const gridColsClass =
            sec.columns === "4"
              ? "grid-cols-2 md:grid-cols-4"
              : sec.columns === "3"
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2";

          return (
            <div key={idx} className="space-y-6">
              {sec.narrative && (
                <div className="prose prose-lg max-w-none leading-relaxed text-gray-800">
                  <AppMarkdown>{sec.narrative}</AppMarkdown>
                </div>
              )}

              {/* Photo Gallery Grid */}
              {sec.photos && sec.photos.length > 0 && (
                <div className={cn("grid gap-4 md:gap-6", gridColsClass)}>
                  {sec.photos.map((p, photoIdx) => {
                    const media =
                      typeof p.image === "object" && p.image !== null
                        ? (p.image as Media)
                        : null;
                    if (!media?.url) return null;

                    return (
                      <figure
                        key={photoIdx}
                        className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
                      >
                        <LightboxModal
                          src={media.url}
                          alt={media.alt || p.caption || "Ảnh sự kiện"}
                          caption={p.caption}
                        >
                          <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                            <Image
                              src={transformUrl(media.url, {
                                width: "600",
                                quality: "85",
                              })}
                              alt={media.alt || p.caption || "Ảnh sự kiện"}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        </LightboxModal>

                        {p.caption && (
                          <figcaption className="p-2.5 text-center text-xs text-gray-500 italic">
                            {p.caption}
                          </figcaption>
                        )}
                      </figure>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Credits */}
      {credits && (
        <footer className="border-t border-gray-100 pt-6 text-right text-sm text-gray-500 italic">
          {credits}
        </footer>
      )}
    </article>
  );
}
