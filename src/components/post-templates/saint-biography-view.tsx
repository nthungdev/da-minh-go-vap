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
  "mt-8 mb-5 text-lg leading-snug font-bold text-secondary sm:text-xl";

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
    <article className="mx-auto max-w-[1140px] rounded-2xl border border-border bg-surface p-card-sm text-lg text-foreground shadow-md md:p-8 md:text-xl">
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
            className="size-36 shrink-0 rounded-pill bg-surface-muted object-cover shadow-md md:size-40"
          />
        )}

        <div className="min-w-0 flex-1">
          <Heading
            className={cn(
              "mb-3 leading-tight font-bold break-words text-secondary",
              isTitleHidden ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
            )}
          >
            {saintName}
          </Heading>
          <p className="text-lg leading-relaxed text-primary md:text-xl">
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
          <ol className="relative space-y-6 pl-7 before:absolute before:top-0 before:left-2.5 before:h-full before:w-1 before:rounded before:bg-primary md:pl-8 md:before:left-3">
            {timeline.map((item, index) => (
              <li
                key={item.id ?? index}
                className="relative pl-4 before:absolute before:top-1.5 before:-left-6 before:size-4 before:rounded-pill before:border-[3px] before:border-primary before:bg-surface md:before:-left-[26px]"
              >
                <p className="mb-1 text-lg leading-normal font-bold text-primary md:text-xl">
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
                className="rounded-xl border border-border-subtle bg-surface-muted p-card-sm md:p-card"
              >
                <VirtueHeading className="mb-4 text-base leading-normal font-bold text-primary sm:text-lg">
                  ✦ {virtue.title}
                </VirtueHeading>
                <AppMarkdown className="space-y-4 md:text-justify [&_p]:leading-[1.9] md:[&_p]:leading-[1.7]">
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
          <AppMarkdown className="space-y-3 rounded-lg border-l-4 border-secondary bg-warning-subtle p-card-sm text-foreground italic md:p-card [&_p]:leading-[1.8]">
            {prayer}
          </AppMarkdown>
        </section>
      )}

      {editor && (
        <p className="mt-6 text-right text-base text-foreground-muted">
          ✍️ {t("editor")}: {editor}
        </p>
      )}

      {references && (
        <div className="mt-5 rounded-lg border border-border-subtle bg-surface-muted px-5 py-4 text-sm leading-[1.8] [overflow-wrap:anywhere] md:text-base">
          <p className="font-bold text-primary">{t("references")}:</p>
          <AppMarkdown className="[&_a]:rounded-sm [&_a]:text-primary [&_a]:transition-colors [&_a]:duration-150 [&_a]:hover:text-primary-900 [&_a]:hover:underline [&_a]:focus-visible:ring-2 [&_a]:focus-visible:ring-ring [&_a]:focus-visible:ring-offset-2 [&_a]:focus-visible:outline-none [&_a]:active:text-primary-950 [&_a]:motion-reduce:transition-none">
            {references}
          </AppMarkdown>
        </div>
      )}
    </article>
  );
}
