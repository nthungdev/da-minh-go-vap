'use client'

import Image from "next/image"

interface TheLatestPostsProps {
  posts: Post[]
  className?: string
}

export default function TheLatestPosts(props: TheLatestPostsProps) {
  const { posts, className } = props

  const latestPost = posts[0]
  const otherPosts = posts.slice(1, 5)

  return (
    <div className={`flex flex-col lg:grid lg:grid-flow-row lg:grid-cols-3 aspect-[2.5] gap-2 w-full ${className}`}>
      <div className="w-full aspect-video lg:aspect-auto col-span-2 bg-blue-200 relative rounded-lg overflow-hidden hover:cursor-pointer hover:ring-2">
        <Image
          className='object-cover'
          src={latestPost.thumbnail}
          alt={latestPost.title}
          fill
        />
        {/* Gradient overlay */}
        <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-b from-transparent to-black from-60%"></div>
        {/* Post text */}
        <div className="absolute flex flex-col bottom-0 left-0 p-3 lg:p-4 text-gray-100 gap-y-1 lg:gap-y-2">
          <span className="text-lg lg:text-2xl line-clamp-1 lg:line-clamp-2 text-gray-100">{latestPost.title}</span>
          <span className="text-xs lg:text-sm text-gray-200">Time posted</span>
        </div>
      </div>

      <div className="grid grid-flow-row lg:grid-flow-col grid-cols-2 lg:grid-cols-1 lg:grid-rows-4 gap-2 relative lg:max-w-full lg:h-full">
        {otherPosts.map((post, index) => (
          // Post card
          <div key={index} className="h-full overflow-hidden flex flex-col lg:flex-row gap-x-2 rounded-lg hover:ring-2 hover:cursor-pointer">
            <div className="relative w-full lg:w-auto lg:h-full aspect-[4/3] overflow-hidden rounded-lg">
              <Image src={post.thumbnail} alt={post.title} fill className="object-cover" />
            </div>
            <div className="flex-1 py-1 md:py-2 lg:py-3 flex flex-col justify-between overflow-hidden">
              <span className="line-clamp-1 lg:line-clamp-2 text-lg text-gray-900">{post.title}</span>
              <span className="text-xs lg:text-sm text-gray-800">Time posted</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
