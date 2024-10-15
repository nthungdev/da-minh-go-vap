'use client'

import Image from 'next/image'
import Link from 'next/link'
import classNames from 'classnames'

interface AppPostGridFiveProps {
  posts: PostParams[]
  className?: string
}

export default function AppPostGridFive({
  posts,
  className,
}: AppPostGridFiveProps) {
  const cellClasses: Record<number, string> = {
    0: '',
    1: 'row-start-2 col-start-1',
    2: 'md:col-start-2 row-start-1 md:row-span-2 md:col-span-2',
    3: '',
    4: '',
    5: '',
  }

  return (
    <ul
      className={`md:aspect-video relative grid grid-flow-row grid-cols-1 md:grid-cols-3 gap-4 ${className}`}
    >
      {posts.slice(0, 6).map((post, index) => (
        // min-w-0 to override min-width: min-content that cause post title to not be truncated
        <li
          key={index}
          className={classNames(
            'md:aspect-video overflow-hidden block w-full min-w-0 bg-white border md:border-transparent hover:ring hover:ring-secondary-200',
            cellClasses[index]
          )}
        >
          <Link
            href={`/posts/${post.slug}`}
            className="block overflow-hidden hover:ring-2"
          >
            <div className="relative aspect-video">
              <Image
                className="object-cover"
                src={post.thumbnail}
                fill
                sizes="100%"
                alt={`${post.title}'s thumbnail`}
              />
            </div>
            <div className="p-2 space-y-2">
              <h2 className="text-center block text-xl truncate">
                {post.title}
              </h2>
              <button className="w-full text-center block">Xem tiếp...</button>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
