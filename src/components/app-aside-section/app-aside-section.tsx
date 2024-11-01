import Link from 'next/link'
import { attributes } from '@/content/settings/aside-section.md'
import { fetchPostsByHiddenTags, fetchPostsBySlugs } from '@/actions/post'
import AppSectionHeader from '@/components/app-section-header'
import AppPostList from '@/components/app-post-list'
import AppPostCard from '@/components/app-post-card'
import AsideSectionSlideshow from './aside-section-slideshow'
import Image from 'next/image'

export default async function AppAsideSection() {
  const { slideshow, curatedPosts, postGroups, links } =
    attributes as AsideSection

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
    <aside className="">
      {slideshow.enable && (
        <AsideSectionSlideshow
          id="aside-section-slideshow"
          className="mb-4"
          slides={slideshow.slides}
        />
      )}

      {postGroups.enable && (
        <div className="bg-primary-1">
          {postGroupsData.map((group, index) => (
            <div key={index} className="">
              <AppSectionHeader className="uppercase">
                {group.title}
              </AppSectionHeader>
              <AppPostList
                className="p-2"
                posts={group.posts}
                itemComponent={AppPostCard}
              />
            </div>
          ))}
        </div>
      )}

      {curatedPosts.enable && (
        <div className="bg-primary-1">
          <AppSectionHeader className="uppercase">
            {curatedPosts.title}
          </AppSectionHeader>
          <AppPostList
            className="w-full p-2"
            posts={curatedPostsData}
            itemComponent={AppPostCard}
          />
        </div>
      )}

      {links.enable && (
        <div className="bg-primary-1">
          <AppSectionHeader className="uppercase">
            {links.title}
          </AppSectionHeader>
          <ul className="space-y-2 p-2">
            {links.links.map((link, index) => (
              <li key={index}>
                <Link
                  target="_blank"
                  href={link.url}
                  className="relative w-full block aspect-[4] border border-transparent hover:ring px-3 py-1"
                >
                  <Image
                    className="object-cover"
                    src={link.image.url}
                    alt={link.image.alt}
                    fill
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}
