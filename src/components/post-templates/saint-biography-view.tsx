import Image from "next/image";
import { useTranslations } from "next-intl";
import AppMarkdown from "@/components/app-markdown";
import type { Media, SaintBiographyBlock } from "@/payload-types";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";

interface Props {
  block: SaintBiographyBlock;
  isTitleHidden?: boolean;
}

const SECTION_HEADING =
  "mt-8 mb-5 text-lg leading-snug font-bold text-secondary-700 sm:text-xl";

export default function SaintBiographyView({ block, isTitleHidden }: Props) {
  const Heading = isTitleHidden ? "h1" : "h2";
  const SectionHeading = isTitleHidden ? "h2" : "h3";
  const VirtueHeading = isTitleHidden ? "h3" : "h4";
  const t = useTranslations("postTemplates");
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
          <Heading
            className={cn(
              "mb-3 leading-tight font-bold text-secondary-700",
              isTitleHidden ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
            )}
          >
            {saintName}
          </Heading>
          <p className="text-[19px] leading-relaxed text-primary-800 md:text-xl">
            {saintTitle}
            <br />
            {feastDay}
          </p>
        </div>
      </header>

      {timeline && timeline.length > 0 && (
        <section>
          <SectionHeading className={SECTION_HEADING}>
            1. {t("saintLife")}
          </SectionHeading>
          <ol className="relative space-y-6 pl-7 before:absolute before:top-0 before:left-2.5 before:h-full before:w-1 before:rounded before:bg-primary-700 md:pl-8 md:before:left-3">
            {timeline.map((item, index) => (
              <li
                key={item.id ?? index}
                className="relative pl-4 before:absolute before:top-1.5 before:-left-6 before:size-4 before:rounded-full before:border-[3px] before:border-primary-700 before:bg-white md:before:-left-[26px]"
              >
                <p className="mb-1 text-[19px] leading-normal font-bold text-primary-800 md:text-xl">
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
          <SectionHeading className={SECTION_HEADING}>
            2. {t("saintVirtues")}
          </SectionHeading>
          <div className="space-y-6">
            {virtues.map((virtue, idx) => (
              <div
                key={virtue.id ?? idx}
                className="rounded-xl bg-slate-50 p-5 md:p-6"
              >
                <VirtueHeading className="mb-4 text-base leading-normal font-bold text-primary-800 sm:text-lg">
                  ✦ {virtue.title}
                </VirtueHeading>
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
          <SectionHeading className={SECTION_HEADING}>
            3. {t("saintPrayer")}
          </SectionHeading>
          <AppMarkdown className="space-y-3 rounded-lg border-l-4 border-red-500 bg-rose-50 p-5 italic md:p-[22px] [&_p]:leading-[1.8]">
            {prayer}
          </AppMarkdown>
        </section>
      )}

      {editor && (
        <p className="mt-6 text-right text-base md:text-[17px]">
          ✍️ {t("editor")}: {editor}
        </p>
      )}

      {references && (
        <div className="mt-5 rounded-lg bg-slate-50 px-5 py-4 text-[15px] leading-[1.8] md:text-base">
          <p className="font-bold text-primary-800">{t("references")}:</p>
          <AppMarkdown className="[&_a]:rounded-sm [&_a]:text-primary-800 [&_a]:hover:underline [&_a]:focus-visible:ring-2 [&_a]:focus-visible:ring-primary-700 [&_a]:focus-visible:outline-none">
            {references}
          </AppMarkdown>
        </div>
      )}
    </article>
  );
}
