import Image from "next/image";
import Link from "next/link";
import AppSectionHeader from "@/components/app-section-header";
import { isDataValid } from "@/payload/utils/data";
import type { LinksBlock } from "@/payload-types";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";

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
    <div
      {...props}
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-surface shadow-sm",
        className,
      )}
    >
      <AppSectionHeader className="rounded-none text-sm tracking-wide uppercase shadow-none">
        {title}
      </AppSectionHeader>
      <ul className="flex flex-col gap-2.5 p-card-sm">
        {links.map((link) => (
          <li key={link.id ?? link.url}>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href={link.url}
              className="relative block aspect-[4] w-full overflow-hidden rounded-lg border border-border-subtle bg-surface-muted transition-[box-shadow,border-color] duration-200 hover:border-primary hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:shadow-none motion-reduce:transition-none"
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
