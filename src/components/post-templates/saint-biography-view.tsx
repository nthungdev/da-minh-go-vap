import Image from "next/image";
import AppMarkdown from "@/components/app-markdown";
import { Media, SaintBiographyBlock } from "@/payload-types";
import { transformUrl } from "@/utils/cloudflare";
import { Calendar, Heart, Sparkles } from "lucide-react";

interface Props {
  block: SaintBiographyBlock;
}

export default function SaintBiographyView({ block }: Props) {
  const { saintName, saintTitle, feastDay, portrait, mainContent, references } =
    block;
  const portraitMedia =
    typeof portrait === "object" && portrait !== null
      ? (portrait as Media)
      : null;

  const { timeline, virtues, prayer } = mainContent;

  return (
    <article className="mx-auto max-w-4xl space-y-10">
      {/* Header Profile Banner */}
      <div className="border-primary-100 from-primary-50/80 to-primary-50/40 flex flex-col items-center gap-6 rounded-2xl border bg-gradient-to-r via-white p-6 shadow-sm sm:flex-row md:p-8">
        {portraitMedia?.url && (
          <div className="relative size-32 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-md md:size-40">
            <Image
              src={transformUrl(portraitMedia.url, {
                width: "400",
                height: "400",
                fit: "crop",
              })}
              alt={portraitMedia.alt || saintName}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-primary-900 text-2xl font-extrabold tracking-tight md:text-3xl">
            {saintName}
          </h1>
          <p className="text-base font-medium text-gray-700 md:text-lg">
            {saintTitle}
          </p>
          <div className="bg-primary-100/80 text-primary-800 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold md:text-sm">
            <Calendar className="size-4" />
            <span>{feastDay}</span>
          </div>
        </div>
      </div>

      {/* 1. Life Timeline */}
      {timeline && timeline.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
            <h2 className="text-xl font-bold text-gray-900">
              1. Dòng thời gian cuộc đời
            </h2>
          </div>

          <div className="border-primary-300 relative ml-4 space-y-8 border-l-2 py-2 md:ml-6">
            {timeline.map((item, index) => (
              <div key={index} className="group relative pl-6 md:pl-8">
                {/* Timeline node */}
                <div className="bg-primary-600 absolute top-1.5 -left-[9px] size-4 rounded-full border-2 border-white shadow-sm" />
                <div className="space-y-1">
                  <span className="bg-primary-50 text-primary-700 inline-block rounded-md px-2.5 py-0.5 text-xs font-bold">
                    {item.periodOrYear}
                  </span>
                  <p className="text-base leading-relaxed text-gray-700">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. Virtues & Teachings */}
      {virtues && virtues.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
            <Heart className="size-5 text-rose-500" />
            <h2 className="text-xl font-bold text-gray-900">
              2. Gương nhân đức & Giáo huấn
            </h2>
          </div>

          <div className="space-y-6">
            {virtues.map((v, idx) => (
              <div
                key={idx}
                className="space-y-3 rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <h3 className="text-primary-800 text-lg font-bold">
                  {v.title}
                </h3>
                <AppMarkdown className="prose prose-lg max-w-none leading-relaxed text-gray-700">
                  {v.body}
                </AppMarkdown>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Intercessory Prayer */}
      {prayer && (
        <section className="border-primary-200 from-primary-50/80 rounded-2xl border bg-gradient-to-br to-amber-50/50 p-6 shadow-sm md:p-8">
          <div className="text-primary-800 mb-3 flex items-center gap-2">
            <Sparkles className="size-5 text-amber-500" />
            <h2 className="text-lg font-bold">Lời nguyện cùng Vị Thánh</h2>
          </div>
          <AppMarkdown className="prose prose-primary leading-relaxed text-gray-800 italic">
            {prayer}
          </AppMarkdown>
        </section>
      )}

      {/* References */}
      {references && (
        <footer className="space-y-2 border-t border-gray-100 pt-6 text-xs text-gray-500 md:text-sm">
          <h4 className="font-semibold text-gray-700">Tài liệu tham khảo:</h4>
          <AppMarkdown className="prose prose-sm max-w-none text-gray-500">
            {references}
          </AppMarkdown>
        </footer>
      )}
    </article>
  );
}
