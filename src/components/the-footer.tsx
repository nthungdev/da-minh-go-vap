import Image from "next/image";
import Markdown from "react-markdown";
import Link from "next/link";
import { getPayload } from "payload";
import config from "@payload-config";
import { getLocale } from "next-intl/server";

export default async function TheFooter() {
  const locale = await getLocale();
  const payload = await getPayload({ config });
  const footer = await payload.findGlobal({ slug: "footer", locale });

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

  return (
    <footer className="relative">
      {footer.topFooterDecorativeGraphic &&
        typeof footer.topFooterDecorativeGraphic !== "string" &&
        typeof footer.topFooterDecorativeGraphic.url === "string" && (
          <Image
            src={footer.topFooterDecorativeGraphic.url}
            alt="Footer background"
            className="pointer-events-none z-0 w-full select-none"
            height={229}
            width={991}
            sizes="100%"
          />
        )}

      {/* layout for small screens */}
      <div className="bg-primary">
        <div className="flex flex-col gap-8 p-4 text-left text-white sm:hidden md:flex-row">
          <Contact
            name={footer.contact.name}
            phone={footer.contact.phone}
            email={footer.contact.email}
            address={footer.contact.address}
            marketingEmail={footer.contact.marketingEmail}
          />

          {chunkedExternalLinks.length > 0 && (
            <div className="flex flex-col gap-x-4 md:flex-row">
              {chunkedExternalLinks.map((chunk, index) => (
                <div key={index} className="flex flex-col justify-end">
                  {chunk.map((link, index) => (
                    <div key={index}>
                      <Link href={link.url}>{link.name}</Link>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* layout for large screens */}
      <div className="3xl:text-xl absolute bottom-0 left-0 hidden max-w-7xl flex-col gap-8 px-4 py-4 text-left text-[0.9vw] text-white sm:flex md:flex-row">
        <Contact
          name={footer.contact.name}
          phone={footer.contact.phone}
          email={footer.contact.email}
          address={footer.contact.address}
          marketingEmail={footer.contact.marketingEmail}
        />

        <div className="flex flex-col gap-x-4 md:flex-row">
          {chunkedExternalLinks.map((chunk, index) => (
            <div key={index} className="flex flex-col justify-end">
              {chunk.map((link, index) => (
                <div key={index}>
                  <Link href={link.url}>{link.name}</Link>
                </div>
              ))}
            </div>
          ))}
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
  return (
    <div>
      <p className="mb-1 font-bold">{name}</p>
      <Markdown>{address}</Markdown>
      <p>
        Đt: <a href={`tel:${phone}`}>{phone}</a>
      </p>
      <p>
        Email: <a href={`mailto:${email}`}>{email}</a>
      </p>

      {marketingEmail && (
        <p>
          Ban truyền thông:{" "}
          <a href={`mailto:${marketingEmail}`}>{marketingEmail}</a>
        </p>
      )}
    </div>
  );
}
