import Image from "next/image";
import Link from "next/link";
import AppSectionHeader from "@/components/app-section-header";
import { isDataValid } from "@/payload/utils/data";
import type { LinksBlock } from "@/payload-types";
import { transformUrl } from "@/utils/cloudflare";

interface ImageLinkListProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  links: LinksBlock["links"];
}

export default function ImageLinkList({
  title,
  links = [],
  className,
  ...props
}: ImageLinkListProps) {
  return (
    <div {...props} className={className}>
      <AppSectionHeader className="uppercase">{title}</AppSectionHeader>
      <ul className="space-y-2 p-2">
        {links.map((link) => (
          <li key={link.id ?? link.url}>
            <Link
              target="_blank"
              href={link.url}
              className="relative block aspect-[4] w-full border border-transparent hover:ring-3"
            >
              {isDataValid(link.image) && link.image.url && (
                <Image
                  unoptimized
                  className="object-cover"
                  src={transformUrl(link.image.url, { width: "250" })}
                  alt={link.image.alt}
                  loading="lazy"
                  fill
                  sizes="(max-width: 640px) 100vw, 20vw"
                />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
