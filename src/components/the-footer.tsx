import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getLocale } from "next-intl/server";
import Markdown from "react-markdown";
import type { Locale } from "@/i18n/config";
import { getFooter } from "@/payload/utils/queries";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";

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

  const hasGraphic = Boolean(
    footer.topFooterDecorativeGraphic &&
      typeof footer.topFooterDecorativeGraphic !== "string" &&
      typeof footer.topFooterDecorativeGraphic.url === "string",
  );

  return (
    <footer className="relative">
      {hasGraphic &&
        typeof footer.topFooterDecorativeGraphic !== "string" &&
        typeof footer.topFooterDecorativeGraphic?.url === "string" && (
          <Image
            unoptimized
            src={transformUrl(footer.topFooterDecorativeGraphic.url, {
              width: "1200",
              quality: "80",
            })}
            alt=""
            className="pointer-events-none z-0 w-full select-none"
            height={229}
            width={991}
            sizes="100vw"
            loading="lazy"
          />
        )}

      <div
        className={cn(
          "bg-primary 3xl:text-xl flex flex-col gap-8 p-4 text-left text-white md:flex-row",
          hasGraphic &&
            "sm:absolute sm:bottom-0 sm:left-0 sm:max-w-7xl sm:bg-transparent sm:text-[0.9vw]",
        )}
      >
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
                <div key={chunkKey} className="flex flex-col justify-end">
                  {chunk.map((link) => (
                    <div key={link.id || `${link.name}-${link.url}`}>
                      <Link href={link.url}>{link.name}</Link>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
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
      <Markdown>{address}</Markdown>
      <p>
        {t("phoneLabel")}: <a href={`tel:${phone}`}>{phone}</a>
      </p>
      <p>
        {t("emailLabel")}: <a href={`mailto:${email}`}>{email}</a>
      </p>

      {marketingEmail && (
        <p>
          {t("marketingEmailLabel")}:{" "}
          <a href={`mailto:${marketingEmail}`}>{marketingEmail}</a>
        </p>
      )}
    </div>
  );
}
