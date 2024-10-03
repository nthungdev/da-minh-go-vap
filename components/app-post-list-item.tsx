import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'

interface AppPostListItemProps {
  post: PostParams
  className?: string
}

export default function AppPostListItem(props: AppPostListItemProps) {
  const { post, className } = props

  return (
    <Link
      href={`/posts/${post.slug}`}
      className={classNames('@container block w-full h-full', className)}
    >
      <div className="hover:ring-2 hover:cursor-pointer w-full h-full overflow-hidden flex flex-row gap-x-2 aspect-[3.5]">
        <div className="relative w-auto h-full aspect-video overflow-hidden">
          <Image
            src={post.thumbnail}
            alt={post.title}
            fill
            sizes="100%"
            className="object-cover"
          />
        </div>
        <div className="flex-1 py-2 flex flex-col justify-between overflow-hidden">
          <span className="line-clamp-2 text-base text-gray-900">
            {post.title}
          </span>
        </div>
      </div>
    </Link>
  )
}
