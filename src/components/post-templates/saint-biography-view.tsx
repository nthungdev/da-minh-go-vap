import Image from "next/image";
import AppMarkdown from "@/components/app-markdown";
import { Media, SaintBiographyBlock } from "@/payload-types";
import { transformUrl } from "@/utils/cloudflare";

interface Props {
  block: SaintBiographyBlock;
}

const SECTION_HEADING =
  "text-secondary mt-8 mb-5 text-2xl leading-snug md:text-[27px]";

export default function SaintBiographyView({ block }: Props) {
  const {
    saintName,
    saintTitle,
    feastDay,
    portrait,
    mainContent,
    editor,
    references,
  } = block;
  const portraitMedia =
    typeof portrait === "object" && portrait !== null
      ? (portrait as Media)
      : null;

  const { timeline, virtues, prayer } = mainContent;

  return (
    <article className="mx-auto max-w-[1140px] rounded-2xl bg-white p-[22px] text-lg text-slate-800 shadow-[0_8px_26px_rgba(0,0,0,0.08)] md:p-[30px] md:text-xl">
      <header className="mb-8 flex flex-col items-center gap-4 text-center md:flex-row md:gap-6 md:text-left">
        {portraitMedia?.url && (
          <Image
            src={transformUrl(portraitMedia.url, {
              width: "320",
              height: "320",
              fit: "crop",
            })}
            alt={portraitMedia.alt || saintName}
            width={160}
            height={160}
            className="size-36 shrink-0 rounded-full object-cover shadow-[0_6px_18px_rgba(0,0,0,0.12)] md:size-40"
          />
        )}

        <div className="flex-1">
          <h2 className="text-secondary mb-3 text-[28px] leading-tight md:text-4xl">
            {saintName}
          </h2>
          <p className="text-primary-800 text-[19px] leading-relaxed md:text-xl">
            {saintTitle}
            <br />
            {feastDay}
          </p>
        </div>
      </header>

      {timeline && timeline.length > 0 && (
        <section>
          <h3 className={SECTION_HEADING}>1. Đôi nét cuộc đời</h3>
          <ol className="before:bg-primary-700 relative space-y-6 pl-7 before:absolute before:top-0 before:left-2.5 before:h-full before:w-1 before:rounded md:pl-8 md:before:left-3">
            {timeline.map((item, index) => (
              <li
                key={item.id ?? index}
                className="before:border-primary-700 relative pl-4 before:absolute before:top-1.5 before:-left-6 before:size-4 before:rounded-full before:border-[3px] before:bg-white md:before:-left-[26px]"
              >
                <p className="text-primary-700 mb-1 text-[19px] leading-normal font-bold md:text-xl">
                  {item.periodOrYear}
                </p>
                <p className="leading-[1.9] md:text-justify md:leading-[1.7]">
                  {item.description}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {virtues && virtues.length > 0 && (
        <section>
          <h3 className={SECTION_HEADING}>2. Gương nhân đức</h3>
          <div className="space-y-6">
            {virtues.map((virtue, idx) => (
              <div
                key={virtue.id ?? idx}
                className="rounded-xl bg-slate-50 p-5 md:p-6"
              >
                <h4 className="text-primary-700 mb-4 text-[21px] leading-normal font-bold md:text-[22px]">
                  ✦ {virtue.title}
                </h4>
                <AppMarkdown className="space-y-[18px] md:text-justify [&_p]:leading-[1.9] md:[&_p]:leading-[1.7]">
                  {virtue.body}
                </AppMarkdown>
              </div>
            ))}
          </div>
        </section>
      )}

      {prayer && (
        <section>
          <h3 className={SECTION_HEADING}>3. Lời nguyện</h3>
          <AppMarkdown className="space-y-3 rounded-lg border-l-4 border-red-500 bg-rose-50 p-5 italic md:p-[22px] [&_p]:leading-[1.8]">
            {prayer}
          </AppMarkdown>
        </section>
      )}

      {editor && (
        <p className="mt-6 text-right text-base md:text-[17px]">
          ✍️ Biên tập: {editor}
        </p>
      )}

      {references && (
        <div className="mt-5 rounded-lg bg-slate-50 px-5 py-4 text-[15px] leading-[1.8] md:text-base">
          <p className="text-primary-800 font-bold">Tham khảo:</p>
          <AppMarkdown className="[&_a]:text-primary-800 [&_a]:focus-visible:ring-primary-700 [&_a]:rounded-sm [&_a]:hover:underline [&_a]:focus-visible:ring-2 [&_a]:focus-visible:outline-none">
            {references}
          </AppMarkdown>
        </div>
      )}
    </article>
  );
}
