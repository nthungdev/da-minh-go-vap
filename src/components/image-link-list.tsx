import AppSectionHeader from "@/components/app-section-header";
import { LinksBlock } from "@/payload-types";
import { isDataValid } from "@/payload/utils/data";
import Image from "next/image";
import Link from "next/link";

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
        {links.map((link, index) => (
          <li key={index}>
            <Link
              target="_blank"
              href={link.url}
              className="relative block aspect-[4] w-full border border-transparent hover:ring-3"
            >
              {isDataValid(link.image) && link.image.url && (
                <Image
                  className="object-cover"
                  src={link.image.url}
                  alt={link.image.alt}
                  fill
                />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
