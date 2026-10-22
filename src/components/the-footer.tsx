import Image from "next/image";
import Markdown from "react-markdown";
import Link from "next/link";
import { getPayload } from "payload";
import config from "@payload-config";
import { getLocale } from "next-intl/server";
import { useMessages } from "next-intl";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";

export default async function TheFooter() {
  const locale = await getLocale();
  const payload = await getPayload({ config });
  const footer = await payload.findGlobal({ slug: "footer", locale });

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
            src={transformUrl(footer.topFooterDecorativeGraphic.url)}
            alt="Footer background"
            className="pointer-events-none z-0 w-full select-none"
            height={229}
            width={991}
            sizes="100vw"
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
            {chunkedExternalLinks.map((chunk, chunkIndex) => (
              <div key={chunkIndex} className="flex flex-col justify-end">
                {chunk.map((link, linkIndex) => (
                  <div key={link.id || `${chunkIndex}-${linkIndex}`}>
                    <Link href={link.url}>{link.name}</Link>
                  </div>
                ))}
              </div>
            ))}
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
  const { contact } = useMessages();

  return (
    <div>
      <p className="mb-1 font-bold">{name}</p>
      <Markdown>{address}</Markdown>
      <p>
        {contact.phoneLabel}: <a href={`tel:${phone}`}>{phone}</a>
      </p>
      <p>
        {contact.emailLabel}: <a href={`mailto:${email}`}>{email}</a>
      </p>

      {marketingEmail && (
        <p>
          {contact.marketingEmailLabel}:{" "}
          <a href={`mailto:${marketingEmail}`}>{marketingEmail}</a>
        </p>
      )}
    </div>
  );
}
