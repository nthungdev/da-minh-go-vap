import { attributes } from '@/content/settings/aside-section.md'
import { getPostsByHiddenTags, getPostsBySlugs } from '@/utils/posts'
import AppPostList from './app-post-list'
import AppSectionHeader from './app-section-header'
import Link from 'next/link'
import AppPostTabGrid from './app-post-tab-grid'
import AppPostCard from './app-post-card'

export default function AppAsideSection() {
  const { curatedPosts, postGroups, socialLinks } = attributes as AsideSection

  const curatedPostsData = getPostsBySlugs(curatedPosts.posts)

  const postGroupsData = postGroups.groups.map((group) => ({
    ...group,
    posts: getPostsByHiddenTags(group.hiddenTags, {
      limit: group.limit,
    }),
  }))

  console.log({postGroupsData})

  return (
    <aside className="space-y-4">
      {
        postGroups.enable && (
          <div className='space-y-4'>
            {postGroupsData.map((group, index) => (
              <div key={index} className='space-y-4'>
                <AppSectionHeader className='uppercase'>{group.title}</AppSectionHeader>
                <AppPostList posts={group.posts} itemComponent={AppPostCard} />
              </div>
            ))}
          </div>
        )
      }

      {curatedPosts.enable && (
        <div className="space-y-4">
          <AppSectionHeader className="uppercase">
            {curatedPosts.title}
          </AppSectionHeader>
          <AppPostList className="w-full" posts={curatedPostsData} />
        </div>
      )}

      {socialLinks.enable && (
        <div className="space-y-4">
          <AppSectionHeader className="uppercase">
            {socialLinks.title}
          </AppSectionHeader>
          <ul className="space-y-2">
            {socialLinks.links.map((link, index) => (
              <li key={index}>
                <Link
                  href={link.url}
                  className="block text-primary-800 hover:text-primary-900 hover:bg-gray-300 px-3 py-1 rounded-md"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}
