import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getLocale } from "next-intl/server";
import Markdown from "react-markdown";
import type { Locale } from "@/i18n/config";
import { getFooter } from "@/payload/utils/queries";
import { transformUrl } from "@/utils/cloudflare";

const footerLinkClassName =
  "inline-block rounded-sm py-1 underline-offset-4 transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none";

export default async function TheFooter() {
  const locale = (await getLocale()) as Locale;
  const footer = await getFooter(locale);

  /**
   * Splits an array of external links into chunks for multi-column footer display.
   */
  const splitExternalLinks = (
    links: NonNullable<(typeof footer)["externalLinks"]>,
    chunkSize: number,
  ) => {
    const result: (typeof links)[] = [];
    for (let i = 0; i < links.length; i += chunkSize) {
      result.push(links.slice(i, i + chunkSize));
    }
    return result;
  };

  const chunkedExternalLinks = splitExternalLinks(
    footer.externalLinks ?? [],
    4,
  );

  const graphic = footer.topFooterDecorativeGraphic;

  return (
    <footer>
      {graphic && typeof graphic !== "string" && graphic.url && (
        <Image
          unoptimized
          src={transformUrl(graphic.url, { width: "1200", quality: "80" })}
          alt=""
          className="pointer-events-none -mb-px w-full select-none"
          height={229}
          width={991}
          sizes="100vw"
          loading="lazy"
        />
      )}

      <div className="bg-primary text-sm text-white md:text-base">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 [overflow-wrap:anywhere] sm:px-6 md:flex-row lg:px-8">
          <Contact
            name={footer.contact.name}
            phone={footer.contact.phone}
            email={footer.contact.email}
            address={footer.contact.address}
            marketingEmail={footer.contact.marketingEmail}
          />

          {chunkedExternalLinks.length > 0 && (
            <div className="flex flex-col gap-x-4 md:flex-row">
              {chunkedExternalLinks.map((chunk) => {
                const chunkKey = chunk
                  .map((link) => link.id || link.url)
                  .join("|");
                return (
                  <div key={chunkKey} className="flex flex-col">
                    {chunk.map((link) => (
                      <div key={link.id || `${link.name}-${link.url}`}>
                        <Link href={link.url} className={footerLinkClassName}>
                          {link.name}
                        </Link>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

function Contact({
  name,
  phone,
  email,
  address,
  marketingEmail,
}: {
  name: string;
  phone: string;
  email: string;
  address: string;
  marketingEmail?: string | null;
}) {
  const t = useTranslations("contact");

  return (
    <div>
      <p className="mb-1 font-bold">{name}</p>
      <Markdown
        components={{
          a: ({ node: _node, ...props }) => (
            <a {...props} className={footerLinkClassName} />
          ),
        }}
      >
        {address}
      </Markdown>
      <p>
        {t("phoneLabel")}:{" "}
        <a href={`tel:${phone}`} className={footerLinkClassName}>
          {phone}
        </a>
      </p>
      <p>
        {t("emailLabel")}:{" "}
        <a href={`mailto:${email}`} className={footerLinkClassName}>
          {email}
        </a>
      </p>

      {marketingEmail && (
        <p>
          {t("marketingEmailLabel")}:{" "}
          <a href={`mailto:${marketingEmail}`} className={footerLinkClassName}>
            {marketingEmail}
          </a>
        </p>
      )}
    </div>
  );
}
