import { PostParams } from '@/definitions'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'

interface AppPostCardProps {
  post: PostParams
  className?: string
}

export default function AppPostCard(props: AppPostCardProps) {
  const { post, className } = props

  return (
    <Link
      href={`/posts/${post.slug}`}
      className={clsx(
        'w-full h-full overflow-hidden flex flex-col lg:flex-row gap-x-2 border border-transparent hover:ring hover:cursor-pointer lg:aspect-[3.5]',
        className
      )}
    >
      <div className="relative lg:w-auto lg:h-full aspect-video overflow-hidden">
        {typeof post.thumbnail !== 'string' &&
          typeof post.thumbnail.url === 'string' && (
            <Image
              src={post.thumbnail.url}
              alt={post.title}
              fill
              sizes="100%"
              className="object-cover"
            />
          )}
      </div>
      <div className="flex-1 px-1.5 lg:px-0 py-1 md:py-1.5 lg:py-2 flex flex-col justify-between overflow-hidden">
        <span className="line-clamp-1 lg:line-clamp-2 text-base text-gray-900 font-header">
          {post.title}
        </span>
      </div>
    </Link>
  )
}
