import Image from "next/image";
import { useTranslations } from "next-intl";
import AppMarkdown from "@/components/app-markdown";
import type { Media, TributeProfileBlock } from "@/payload-types";
import { transformUrl } from "@/utils/cloudflare";
import {
  normalizeFactLabel,
  resolveBiographyHeading,
  resolveTributeSources,
} from "@/utils/tribute-profile";

export default function TributeProfileView({
  block,
}: {
  block: TributeProfileBlock;
}) {
  const t = useTranslations("postTemplates");
  const {
    fullName,
    subtitle,
    portrait,
    summaryFacts,
    biographyHeading,
    biography,
    sources,
  } = block;
  const portraitMedia: Media | null =
    typeof portrait === "object" ? portrait : null;
  const facts = (summaryFacts ?? []).filter(
    ({ label, value }) => label && normalizeFactLabel(label) && value?.trim(),
  );
  const resolvedSources = resolveTributeSources(sources);

  return (
    <article className="bg-white">
      <header className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
        {portraitMedia?.url && (
          <Image
            src={transformUrl(portraitMedia.url, {
              width: "480",
              height: "640",
              fit: "cover",
            })}
            width={240}
            height={320}
            alt={portraitMedia.alt || fullName}
            className="mx-auto aspect-[3/4] w-48 shrink-0 rounded-xl object-cover shadow-sm sm:w-56 md:mx-0 md:w-60"
          />
        )}
        <div className="min-w-0 flex-1 [overflow-wrap:anywhere]">
          <h2 className="text-2xl leading-tight font-semibold text-slate-900 md:text-3xl">
            {fullName}
          </h2>
          {subtitle?.trim() && (
            <p className="mt-1.5 text-base text-slate-600 italic md:text-lg">
              {subtitle}
            </p>
          )}
          {facts.length > 0 && (
            <dl className="mt-4 space-y-2 rounded-r-lg border-l-4 border-primary-700 bg-slate-50 px-5 py-4 text-[15px] leading-relaxed md:text-base">
              {facts.map((fact, index) => (
                <div key={fact.id ?? index}>
                  <dt className="inline font-semibold text-slate-900">
                    {normalizeFactLabel(fact.label)}:{" "}
                  </dt>
                  <dd className="inline text-slate-700">{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </header>

      <section className="mt-8">
        <h3 className="mb-3 text-lg font-bold text-slate-900 md:text-xl">
          {resolveBiographyHeading(biographyHeading, t("tributeBiography"))}
        </h3>
        <AppMarkdown className="space-y-4 leading-[1.8] text-slate-800 md:text-justify [&_h1]:text-base md:[&_h1]:text-lg [&_h2]:text-base md:[&_h2]:text-lg [&_h3]:text-base">
          {biography}
        </AppMarkdown>
      </section>

      {resolvedSources.length > 0 && (
        <section className="mt-8 border-t border-slate-200 pt-5">
          <h3 className="mb-2.5 text-base font-semibold text-slate-700">
            {t("source")}
          </h3>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-700 md:text-[15px]">
            {resolvedSources.map((source) => (
              <li key={source.id} className="[overflow-wrap:anywhere]">
                {source.href ? (
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-sm text-primary-800 underline decoration-primary-800/50 underline-offset-2 transition-colors hover:text-primary-900 hover:decoration-primary-900 focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:outline-none motion-reduce:transition-none"
                  >
                    {source.label}
                  </a>
                ) : (
                  <span>{source.label}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
