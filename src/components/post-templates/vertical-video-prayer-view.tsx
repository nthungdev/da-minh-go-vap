import AppMarkdown from "@/components/app-markdown";
import { VerticalVideoPrayerBlock } from "@/payload-types";
import { stripWrappingQuotes } from "@/utils/quote";

interface Props {
  block: VerticalVideoPrayerBlock;
}

export default function VerticalVideoPrayerView({ block }: Props) {
  const { video, intentionPrayer, scriptureAnchor } = block;

  const videoId = encodeURIComponent(video.videoId.trim());
  const facebookWatchUrl = `https://www.facebook.com/watch/?v=${videoId}`;
  const embedUrl =
    video.type === "youtube"
      ? `https://www.youtube.com/embed/${videoId}`
      : `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(facebookWatchUrl)}&show_text=0`;
  const verse = scriptureAnchor?.verse
    ? stripWrappingQuotes(scriptureAnchor.verse)
    : null;

  return (
    <article className="md:grid md:grid-cols-[minmax(200px,1fr)_4fr] md:gap-10">
      <div className="mb-5 flex justify-center md:mb-0">
        <div className="aspect-[9/16] w-full max-w-[420px] overflow-hidden rounded-[14px] bg-black">
          <iframe
            src={embedUrl}
            title="Ý chỉ cầu nguyện video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="block size-full border-0"
          />
        </div>
      </div>

      <div className="flex flex-col justify-start text-justify text-base leading-normal text-gray-800 md:justify-center">
        <div>
          <AppMarkdown className="prose prose-p:my-0 prose-p:text-justify max-w-none text-[1em] leading-normal text-gray-800 [&>p:last-child]:inline">
            {intentionPrayer}
          </AppMarkdown>
          {verse && (
            <>
              {" "}
              <strong className="rounded bg-[#d8f6f6] box-decoration-clone px-1.5 py-0.5 font-semibold text-[#007777]">
                “{verse}”
              </strong>
              {scriptureAnchor?.reference && (
                <> ({scriptureAnchor.reference})</>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
