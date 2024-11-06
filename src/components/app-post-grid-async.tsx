'use client'

import { fetchPostsByHiddenTags } from '@/actions/post'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import AppViewMoreLink from './app-view-more-link'
import AppPostGridSkeleton from './app-post-grid-skeleton'

interface AppPostGridProps {
  hiddenTags: string[]
  limit: number
  title: string
  posts?: PostParams[]
  hasMore?: boolean
  classNames?: string
}

export default function AppPostGrid({
  hiddenTags,
  limit,
  title,
  posts,
  hasMore,
  classNames,
}: AppPostGridProps) {
  const { data, error, isPending } = useQuery({
    queryKey: ['fetchPostsByHiddenTags', hiddenTags],
    queryFn: async () => {
      const posts = await fetchPostsByHiddenTags(hiddenTags, {
        limit,
      })
      return posts
    },
    initialData: { posts: posts || [], hasMore: hasMore || false },
  })

  if (isPending) return <AppPostGridSkeleton count={limit} />

  if (error) return <p>Error: {error.message}</p>

  if (data) {
    const { posts, hasMore } = data
    const viewMoreHref = `/posts?ht=${encodeURIComponent(
      hiddenTags.join(',')
    )}&ti=${encodeURIComponent(title)}`

    return (
      <div className="space-y-2">
        <ul
          className={`relative grid grid-flow-row md:grid-cols-2 lg:grid-cols-4 gap-4 ${classNames}`}
        >
          {posts.map((post, index) => (
            // min-w-0 to override min-width: min-content that cause post title to not be truncated
            <li
              className="block w-full min-w-0 bg-white hover:ring border border-transparent"
              key={index}
            >
              <Link
                href={`/posts/${post.slug}`}
                className="block overflow-hidden border"
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
                  <span className="text-center block text-xl truncate">
                    {post.title}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {hasMore && (
          <div className="flex flex-row justify-end">
            <AppViewMoreLink href={viewMoreHref} />
          </div>
        )}
      </div>
    )
  }
}
