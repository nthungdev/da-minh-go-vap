import React, { ElementType } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface VideoTileProps {
  videoUrl: string;
  title: string;
  thumbnail: string;
  titleComponent?: ElementType
}

export default function AppVideoTile({
  videoUrl,
  thumbnail,
  title,
  titleComponent: TitleComponent = 'div',
}: VideoTileProps) {
  return (
    <Link
      href={videoUrl}
      className='inline-block'
      target='_blank'
    >
      <div className='inline-block rounded-lg overflow-hidden border-2 w-[256px] hover:ring-2'>
        <Image
          className='w-full aspect-video object-cover'
          src={thumbnail}
          width={256}
          height={144}
          alt={`${title}'s thumbnail`}
        />
        <TitleComponent className='text-center py-2 px-2 truncate block'>{title}</TitleComponent>
      </div>
    </Link>
  );
};
