import Image from 'next/image'
import Link from 'next/link'

interface AppPostGridProps {
  posts: PostParams[]
  classNames?: string
}

export default function AppPostGrid({ posts, classNames }: AppPostGridProps) {
  return (
    <ul
      className={`relative grid grid-flow-row md:grid-cols-2 lg:grid-cols-4 gap-4 ${classNames}`}
    >
      {posts.map((post, index) => (
        // min-w-0 to override min-width: min-content that cause post title to not be truncated
        <li className="block w-full min-w-0 bg-white" key={index}>
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
