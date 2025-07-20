import Image from "next/image";
import Markdown from "react-markdown";
import Link from "next/link";
import { getPayload } from "payload";
import config from "@payload-config";

export default async function TheFooter() {
  const payload = await getPayload({ config });
  const footer = await payload.findGlobal({ slug: "footer" });

  const splitExternalLinks = (links: any[], chunkSize: number) => {
    const result: any[][] = [];
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
    <footer className="relative bg-primary">
      {footer.topFooterDecorativeGraphic &&
        typeof footer.topFooterDecorativeGraphic !== "string" &&
        typeof footer.topFooterDecorativeGraphic.url === "string" && (
          <Image
            src={footer.topFooterDecorativeGraphic.url}
            alt="Footer background"
            className="w-full z-0 pointer-events-none select-none"
            height={229}
            width={991}
            sizes="100%"
          />
        )}

      <div className="bg-primary">
        {/* layout for small screens */}
        <div className="p-4 max-w-screen-xl sm:hidden flex flex-col md:flex-row gap-8 text-white text-left">
          <Contact
            name={footer.contact.name}
            phone={footer.contact.phone}
            email={footer.contact.email}
            address={footer.contact.address}
            marketingEmail={footer.contact.marketingEmail}
          />

          <div className="flex flex-col md:flex-row gap-x-4">
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
      </div>

      {/* layout for large screens */}
      <div className="hidden sm:flex flex-col md:flex-row left-0 bottom-0 px-4 py-4 mx-auto max-w-screen-xl gap-8 text-white text-left text-[0.9vw] 3xl:text-xl">
        <Contact
          name={footer.contact.name}
          phone={footer.contact.phone}
          email={footer.contact.email}
          address={footer.contact.address}
          marketingEmail={footer.contact.marketingEmail}
        />

        <div className="flex flex-col md:flex-row gap-x-4">
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
  marketingEmail: string;
}) {
  return (
    <div>
      <p className="font-bold mb-1">{name}</p>
      <Markdown>{address}</Markdown>
      <p>
        Đt: <a href={`tel:${phone}`}>{phone}</a>
      </p>
      <p>
        Email: <a href={`mailto:${email}`}>{email}</a>
      </p>
      <p>
        Ban truyền thông:{" "}
        <a href={`mailto:${marketingEmail}`}>{marketingEmail}</a>
      </p>
    </div>
  );
}
