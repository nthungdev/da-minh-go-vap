import Image from "next/image";
import AppMarkdown from "@/components/app-markdown";
import SpotifyEmbed from "@/components/post-templates/shared/spotify-embed";
import { GospelReflectionCardBlock, Media } from "@/payload-types";
import { transformUrl } from "@/utils/cloudflare";
import { ChevronDown } from "lucide-react";

interface Props {
  block: GospelReflectionCardBlock;
}

export default function GospelReflectionCardView({ block }: Props) {
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
    ? `Xem Tin Mừng (${gospel.reference})`
    : "Xem Tin Mừng";

  return (
    <article className="rounded-[18px] border border-[#008596]/12 bg-gradient-to-b from-white to-[#fbfbfe] p-4 font-[system-ui,-apple-system,'Segoe_UI',Roboto,Arial,sans-serif] text-base text-slate-900 shadow-[0_6px_20px_rgba(18,25,40,0.08)] sm:p-[26px] md:text-xl xl:text-2xl">
      <div className="relative mb-2.5 flex flex-wrap items-center gap-3.5">
        <span className="text-chill-800 rounded-[10px] bg-gradient-to-r from-[#008596]/12 to-[#008596]/6 px-3 py-2 text-[0.95em] leading-snug font-semibold">
          {liturgyMeta}
        </span>

        {gospel?.content && (
          <details className="group text-[0.95em]">
            <summary className="text-chill-800 focus-visible:ring-chill-700 inline-flex cursor-pointer list-none items-center gap-1 rounded font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
              <span>{gospelLabel}</span>
              <ChevronDown
                aria-hidden="true"
                className="size-[1em] transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
              />
            </summary>
            <div className="fixed inset-x-[5%] bottom-[10%] z-30 max-h-[60vh] overflow-y-auto rounded-xl border border-[#008596]/20 bg-white px-[18px] py-4 text-[0.95em] shadow-[0_8px_20px_rgba(15,23,42,0.12)] sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-0 sm:mt-2 sm:max-h-none sm:w-[min(480px,92vw)] sm:overflow-visible">
              <AppMarkdown className="prose prose-p:my-0 prose-p:text-justify prose-blockquote:m-0 prose-blockquote:border-s-0 prose-blockquote:p-0 prose-blockquote:ps-0 prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-inherit max-w-none text-[1em] leading-[1.68] text-slate-900 [&_blockquote_p]:before:content-none [&_blockquote_p]:after:content-none">
                {gospel.content}
              </AppMarkdown>
            </div>
          </details>
        )}
      </div>

      <SpotifyEmbed url={spotifyUrl} />

      {headline && (
        <h2 className="mt-1.5 mb-3.5 text-center text-[1.45em] leading-[1.2] font-medium text-orange-600">
          {headline}
        </h2>
      )}

      <div className="flow-root text-[0.98em] leading-[1.68]">
        {imageMedia?.url && (
          <figure className="mx-auto mb-5 max-w-full md:float-left md:mr-5 md:mb-[15px] md:w-[40%]">
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg md:aspect-square md:rounded-full">
              <Image
                src={transformUrl(imageMedia.url, {
                  width: "800",
                  quality: "85",
                })}
                alt={imageMedia.alt || headline || "Hình suy niệm"}
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
            {imageCaption && (
              <figcaption className="mt-2 text-center text-sm text-gray-500 italic">
                {imageCaption}
              </figcaption>
            )}
          </figure>
        )}

        <AppMarkdown className="prose prose-p:my-2.5 prose-p:text-justify prose-li:text-justify max-w-none text-[1em] leading-[1.68] text-[#0b1220]">
          {body}
        </AppMarkdown>
      </div>

      {(author || audioReader) && (
        <div className="mt-[18px] text-right text-[0.95em] leading-[1.6] text-gray-500">
          {author && (
            <p>
              <strong>Tác giả:</strong> {author}
            </p>
          )}
          {audioReader && (
            <p>
              <strong>Giọng đọc:</strong> {audioReader}
            </p>
          )}
        </div>
      )}

      <div
        aria-hidden="true"
        className="mt-[18px] h-1.5 rounded-md bg-gradient-to-r from-[#008596] to-[#32c7c7]"
      />
    </article>
  );
}
