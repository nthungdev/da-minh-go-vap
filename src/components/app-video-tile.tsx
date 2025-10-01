import React, { ElementType } from "react";
import Link from "next/link";
import Image from "next/image";

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
  return (
    <Link
      href={videoUrl}
      className="block w-full border border-transparent hover:ring-2"
      target="_blank"
    >
      <div className="w-full overflow-hidden border hover:ring-2">
        <div className="relative aspect-video w-full">
          <Image
            className="w-full object-cover"
            src={thumbnail}
            fill
            alt={`${title}'s thumbnail`}
          />
        </div>
        <TitleComponent className="block truncate px-2 py-2 text-center">
          {title}
        </TitleComponent>
      </div>
    </Link>
  );
}
