import Image from 'next/image'
import Link from 'next/link'

interface AppPostCardProps {
  post: PostParams
}

export default function AppPostCard(props: AppPostCardProps) {
  const { post } = props

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="w-full h-full overflow-hidden flex flex-col lg:flex-row gap-x-2 hover:ring-2 hover:cursor-pointer lg:aspect-[3.5]"
    >
      <div className="relative lg:w-auto lg:h-full aspect-video lg:aspect-square overflow-hidden">
        <Image
          src={post.thumbnail}
          alt={post.title}
          fill
          sizes="100%"
          className="object-cover"
        />
      </div>
      <div className="flex-1 px-1.5 lg:px-0 py-1 md:py-1.5 lg:py-2 flex flex-col justify-between overflow-hidden">
        <span className="line-clamp-1 lg:line-clamp-2 text-base text-gray-900">
          {post.title}
        </span>
        {/* <span className="lg:hidden text-xs lg:text-sm text-gray-800">
          {post.date.toLocaleDateString('vi-VN')}
        </span> */}
      </div>
    </Link>
  )
}
