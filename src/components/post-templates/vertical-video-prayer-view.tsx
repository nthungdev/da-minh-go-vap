import AppMarkdown from "@/components/app-markdown";
import { VerticalVideoPrayerBlock } from "@/payload-types";
import { BookOpen, Sparkles } from "lucide-react";

interface Props {
  block: VerticalVideoPrayerBlock;
}

export default function VerticalVideoPrayerView({ block }: Props) {
  const { video, intentionPrayer, scriptureAnchor } = block;

  const embedUrl =
    video.type === "youtube"
      ? `https://www.youtube.com/embed/${video.videoId}`
      : `https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/watch/?v=${video.videoId}&show_text=0`;

  return (
    <article className="mx-auto max-w-5xl">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
        {/* Left Column: 9:16 Vertical Video */}
        <div className="flex justify-center lg:col-span-5">
          <div className="relative aspect-[9/16] w-full max-w-[360px] overflow-hidden rounded-2xl bg-black shadow-xl ring-1 ring-black/10">
            <iframe
              src={embedUrl}
              title="Ý chỉ cầu nguyện video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="size-full border-0"
            />
          </div>
        </div>

        {/* Right Column: Intention Prayer & Scripture Anchor */}
        <div className="space-y-6 lg:col-span-7">
          <div className="bg-primary-50 text-primary-700 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold">
            <Sparkles className="text-primary-600 size-4" />
            <span>Ý chỉ cầu nguyện</span>
          </div>

          <div className="prose prose-lg max-w-none leading-relaxed text-gray-800">
            <AppMarkdown>{intentionPrayer}</AppMarkdown>
          </div>

          {/* Scripture Anchor Quote */}
          {scriptureAnchor?.verse && (
            <div className="border-primary-500 bg-primary-50/60 rounded-2xl border-l-4 p-5 text-gray-800">
              <div className="flex items-start gap-2">
                <BookOpen className="text-primary-600 mt-0.5 size-5 shrink-0" />
                <div className="space-y-1">
                  <p className="font-serif text-base italic md:text-lg">
                    “{scriptureAnchor.verse}”
                  </p>
                  {scriptureAnchor.reference && (
                    <p className="text-primary-800 text-right text-xs font-semibold md:text-sm">
                      ({scriptureAnchor.reference})
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
