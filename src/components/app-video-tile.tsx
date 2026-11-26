import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ElementType } from "react";

interface VideoTileProps {
  videoUrl: string;
  title: string;
  thumbnail: string;
  titleComponent?: ElementType;
}

export default function AppVideoTile({
  videoUrl,
  thumbnail,
  title,
  titleComponent: TitleComponent = "div",
}: VideoTileProps) {
  const t = useTranslations("common");
  return (
    <Link
      href={videoUrl}
      className="group block w-full min-w-0 overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-[box-shadow,border-color] duration-200 hover:border-primary/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:shadow-xs motion-reduce:transition-none"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-surface-muted">
        <Image
          className="object-cover"
          src={thumbnail}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          alt={t("thumbnailAlt", { title })}
        />
      </div>
      <TitleComponent className="block truncate px-card-sm py-2.5 text-center text-sm font-medium text-foreground transition-colors duration-200 group-hover:text-primary motion-reduce:transition-none">
        {title}
      </TitleComponent>
    </Link>
  );
}
