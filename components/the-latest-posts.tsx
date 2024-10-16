'use client'

import Image from 'next/image'
import Link from 'next/link'
import AppPostCard from './app-post-card'
import classNames from 'classnames'

interface TheLatestPostsProps {
  posts: PostParams[]
  className?: string
}

export default function TheLatestPosts(props: TheLatestPostsProps) {
  const { posts, className } = props

  const latestPost = posts[0]
  const otherPosts = posts.slice(1, 5)

  return (
    <div
      className={`flex flex-col lg:grid lg:grid-flow-row lg:grid-cols-3 aspect-[2.5] gap-2 w-full ${className}`}
    >
      <Link
        href={`/posts/${latestPost.slug}`}
        className="col-span-2 aspect-video lg:aspect-auto"
      >
        <div className="w-full h-full bg-blue-200 relative overflow-hidden hover:cursor-pointer hover:ring-2">
          <Image
            className="object-cover"
            src={latestPost.thumbnail}
            alt={latestPost.title}
            sizes="100%"
            priority
            fill
          />
          {/* Gradient overlay */}
          <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-b from-transparent to-black from-60%"></div>
          {/* Post text */}
          <div className="absolute flex flex-col bottom-0 left-0 p-3 lg:p-4 text-gray-100 gap-y-1 lg:gap-y-2">
            <span className="text-lg lg:text-2xl line-clamp-1 lg:line-clamp-2 text-gray-100">
              {latestPost.title}
            </span>
            <span className="text-xs lg:text-sm text-gray-200">
              {latestPost.date.toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>
      </Link>

      <div className="grid grid-flow-row lg:grid-flow-col grid-cols-2 lg:grid-cols-1 lg:grid-rows-4 gap-2 relative lg:max-w-full lg:h-full">
        {otherPosts.map((post, index) => (
          <AppPostCard
            key={index}
            post={post}
            className={classNames(
              'border lg:border-transparent',
              index % 2 === 0 ? 'lg:bg-primary-50' : 'lg:bg-primary-100'
            )}
          />
        ))}
      </div>
    </div>
  )
}
