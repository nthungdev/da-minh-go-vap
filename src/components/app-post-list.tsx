import { PostParams } from '@/definitions'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'

function DefaultItemComponent({ post }: { post: PostParams }) {
  return (
    <Link href={`/posts/${post.slug}`} className="w-full">
      <div className="w-full rounded-lg overflow-hidden border-2 hover:ring-2">
        <Image
          className="w-full aspect-video object-cover"
          src={post.thumbnail}
          width={256}
          height={144}
          alt={`${post.title}'s thumbnail`}
        />
        <div className="p-2 space-y-2">
          <h2 className="text-center truncate block text-xl">{post.title}</h2>
          <button className="w-full text-center block">Xem tiếp...</button>
        </div>
      </div>
    </Link>
  )
}

interface AppPostListProps {
  posts: PostParams[]
  className?: string
  itemComponent?: React.ElementType
}

export default function AppPostList(props: AppPostListProps) {
  const { posts, className, itemComponent } = props
  const ItemComponent = itemComponent ? itemComponent : DefaultItemComponent

  return (
    <ul className={clsx('relative flex flex-col gap-4 rounded-sm', className)}>
      {posts.map((post, index) => (
        <li className="block w-full" key={index}>
          <ItemComponent post={post} />
        </li>
      ))}
    </ul>
  )
}
