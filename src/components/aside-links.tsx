import AppSectionHeader from "@/components/app-section-header";
import { Media } from "@/payload-types";
import Image from "next/image";
import Link from "next/link";

interface AsideLinksProps {
  title: string;
  links: {
    url: string;
    image: Media;
  }[];
}

export default function AsideLinks({ title, links = [] }: AsideLinksProps) {
  return (
    <div>
      <AppSectionHeader className="uppercase">{title}</AppSectionHeader>
      <ul className="space-y-2 p-2">
        {links.map((link, index) => (
          <li key={index}>
            <Link
              target="_blank"
              href={link.url}
              className="relative w-full block aspect-[4] border border-transparent hover:ring"
            >
              {typeof link.image !== "string" &&
                typeof link.image.url === "string" && (
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
