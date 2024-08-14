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
      className='inline-block w-full'
      target='_blank'
    >
      <div className='w-full inline-block rounded-lg overflow-hidden border-2 hover:ring-2'>
        <div className='w-full lg:w-[256px] relative aspect-video'>
          <Image
            className='w-full object-cover'
            src={thumbnail}
            fill
            alt={`${title}'s thumbnail`}
          />
        </div>
        <TitleComponent className='text-center py-2 px-2 truncate block'>{title}</TitleComponent>
      </div>
    </Link>
  );
};
