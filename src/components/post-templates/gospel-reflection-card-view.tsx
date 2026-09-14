import Image from "next/image";
import AppMarkdown from "@/components/app-markdown";
import SpotifyEmbed from "@/components/post-templates/shared/spotify-embed";
import { GospelReflectionCardBlock, Media } from "@/payload-types";
import { transformUrl } from "@/utils/cloudflare";
import { BookOpen, ChevronDown } from "lucide-react";

interface Props {
  block: GospelReflectionCardBlock;
}

export default function GospelReflectionCardView({ block }: Props) {
  const { liturgyMeta, image, spotifyUrl, gospel, body, author, audioReader } =
    block;
  const imageMedia =
    typeof image === "object" && image !== null ? (image as Media) : null;

  return (
    <article className="mx-auto max-w-4xl rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-10">
      {/* Liturgy meta header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <span className="text-primary-700 text-xs font-semibold tracking-wider uppercase md:text-sm">
          {liturgyMeta}
        </span>

        {/* Collapsible Gospel reading */}
        {gospel?.content && (
          <details className="group relative">
            <summary className="bg-primary-50 text-primary-700 hover:bg-primary-100 inline-flex cursor-pointer list-none items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition focus:outline-none">
              <BookOpen className="size-3.5" />
              <span>
                Xem Tin Mừng {gospel.reference && `(${gospel.reference})`}
              </span>
              <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" />
            </summary>
            <div className="border-primary-100 absolute right-0 z-30 mt-2 w-80 rounded-2xl border bg-white p-5 text-sm text-gray-700 shadow-xl md:w-96">
              <h4 className="text-primary-800 mb-2 border-b border-gray-100 pb-2 font-bold">
                Tin Mừng {gospel.reference && `(${gospel.reference})`}
              </h4>
              <AppMarkdown className="prose prose-sm max-w-none text-gray-700">
                {gospel.content}
              </AppMarkdown>
            </div>
          </details>
        )}
      </div>

      {/* Hero Image (optional) */}
      {imageMedia?.url && (
        <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-xl bg-gray-100 shadow-sm">
          <Image
            src={transformUrl(imageMedia.url, { width: "1200", quality: "85" })}
            alt={imageMedia.alt || "Hình suy niệm"}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Spotify Podcast Embed */}
      {spotifyUrl && (
        <div className="mt-6">
          <SpotifyEmbed url={spotifyUrl} />
        </div>
      )}

      {/* Meditation content */}
      <div className="mt-8">
        <AppMarkdown className="prose prose-lg max-w-none leading-relaxed text-gray-800">
          {body}
        </AppMarkdown>
      </div>

      {/* Footer attribution */}
      {(author || audioReader) && (
        <footer className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-6 text-sm text-gray-600">
          {author && (
            <div>
              <span className="font-semibold text-gray-800">Tác giả: </span>
              <span>{author}</span>
            </div>
          )}
          {audioReader && (
            <div>
              <span className="font-semibold text-gray-800">Giọng đọc: </span>
              <span>{audioReader}</span>
            </div>
          )}
        </footer>
      )}
    </article>
  );
}
