import Link from 'next/link'
import { attributes } from '@/content/settings/aside-section.md'
import { fetchPostsByHiddenTags, fetchPostsBySlugs } from '@/actions/post'
import AppPostList from './app-post-list'
import AppSectionHeader from './app-section-header'
import AppPostCard from './app-post-card'
import AppCarousel from './app-carousel'
import Image from 'next/image'

export default async function AppAsideSection() {
  const { slideshow, curatedPosts, postGroups, socialLinks } =
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
        <div className="mb-4 w-full aspect-[2/3] overflow-hidden">
          <AppCarousel>
            {slideshow.slides.map((slide, index) => (
              <Image
                key={index}
                className="object-cover h-full w-full"
                src={slide.url}
                alt={slide.alt || ''}
                sizes="100%"
                width={0}
                height={0}
              />
            ))}
          </AppCarousel>
        </div>
      )}

      {postGroups.enable && (
        <div className="bg-primary-100">
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
        <div className="bg-primary-100">
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

      {socialLinks.enable && (
        <div className="bg-primary-100">
          <AppSectionHeader className="uppercase">
            {socialLinks.title}
          </AppSectionHeader>
          <ul className="space-y-2 p-2">
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
