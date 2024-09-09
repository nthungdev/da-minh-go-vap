import { attributes } from '@/content/settings/aside-section.md'
import AppPostList from './app-post-list'
import AppSectionHeader from './app-section-header'
import Link from 'next/link'
import AppPostCard from './app-post-card'
import { fetchPostsByHiddenTags, fetchPostsBySlugs } from '@/actions/post'

export default async function AppAsideSection() {
  const { curatedPosts, postGroups, socialLinks } = attributes as AsideSection

  const curatedPostsData = await fetchPostsBySlugs(curatedPosts.posts)

  const postGroupsData = []
  for (const group of postGroups.groups) {
    postGroupsData.push({
      ...group,
      posts: await fetchPostsByHiddenTags(group.hiddenTags, {
        limit: group.limit,
      }),
    })
  }

  return (
    <aside className="space-y-4">
      {postGroups.enable && (
        <div className="space-y-4">
          {postGroupsData.map((group, index) => (
            <div key={index} className="space-y-4">
              <AppSectionHeader className="uppercase">
                {group.title}
              </AppSectionHeader>
              <AppPostList posts={group.posts} itemComponent={AppPostCard} />
            </div>
          ))}
        </div>
      )}

      {curatedPosts.enable && (
        <div className="space-y-4">
          <AppSectionHeader className="uppercase">
            {curatedPosts.title}
          </AppSectionHeader>
          <AppPostList
            className="w-full"
            posts={curatedPostsData}
            itemComponent={AppPostCard}
          />
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
