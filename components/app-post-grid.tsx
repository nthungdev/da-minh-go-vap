import Image from "next/image";
import Link from "next/link";

interface AppPostGridProps {
  posts: PostParams[]
}

export default function AppPostGrid({ posts }: AppPostGridProps) {
  return (
    <ul className='relative grid grid-flow-row md:grid-cols-3 lg:grid-cols-4 gap-8'>
      {posts.map((post, index) => (
        <li className='block w-full' key={index}>
          <Link
            href={`/posts/${post.slug}`}
            className='w-full'
          >
            <div className='w-full inline-block rounded-lg overflow-hidden border-2 hover:ring-2'>
              <Image
                className='w-full aspect-video object-cover'
                src={post.thumbnail}
                width={256}
                height={144}
                alt={`${post.title}'s thumbnail`}
              />
              <div className='p-2 space-y-2'>
                <h2 className='text-center truncate block text-xl'>{post.title}</h2>
                <button className='w-full text-center block'>Xem tiếp...</button>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}