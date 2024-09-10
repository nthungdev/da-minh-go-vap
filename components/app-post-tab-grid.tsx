'use client'

import { ChangeEvent } from 'react'
import AppPostGrid from './app-post-grid'
import AppSelectBasic from './app-select-basic'

const ALL_POSTS_CONTROL_LABEL = 'Tất cả'

interface AppPostTabGridProps {
  /** id should be provided when there are multiple AppPostTabGrid components on the same page */
  id?: string
  classNames?: string
  postGroups: {
    title: string
    posts: PostParams[]
  }[]
  allPostsLimit?: number
  component?: React.ElementType
}

export default function AppPostTabGrid(props: AppPostTabGridProps) {
  const {
    id = 'post-tab-grid',
    postGroups,
    classNames,
    allPostsLimit,
    component,
  } = props

  const DataComponent = component ? component : AppPostGrid

  const allPosts = postGroups
    .reduce((acc, { posts }) => [...acc, ...posts], [] as PostParams[])
    .toSorted((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, allPostsLimit)

  const postGroupsData = [
    {
      title: ALL_POSTS_CONTROL_LABEL,
      posts: allPosts,
    },
    ...postGroups,
  ]

  console.log({
    postGroupsData,
    // allPosts,
    allPostsCount: allPosts.length,
    allPostsLimit,
  })

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedGroup = postGroupsData.find(
      (group) => group.title === event.target.value
    )

    if (selectedGroup) {
      const tab = document.querySelector<HTMLButtonElement>(
        `#${id}-item-${postGroupsData.indexOf(selectedGroup)}`
      )

      if (tab) {
        tab.click()
      }
    }
  }

  return (
    <div className={`${classNames}`}>
      <div>
        <AppSelectBasic
          className="lg:hidden"
          defaultValue={ALL_POSTS_CONTROL_LABEL}
          options={[
            {
              value: ALL_POSTS_CONTROL_LABEL,
            },
            ...postGroups.map((group) => ({
              value: group.title,
            })),
          ]}
          onChange={handleSelectChange}
        />
        <nav
          className="hidden lg:flex gap-x-4"
          aria-label="Tabs"
          role="tablist"
          aria-orientation="horizontal"
        >
          {postGroupsData.map(({ title }, index) => (
            <button
              key={`${id}-control-${index}`}
              type="button"
              className={`hs-tab-active:bg-primary-600 hs-tab-active:text-white hs-tab-active:hover:text-white py-3 px-4 text-center basis-0 grow inline-flex justify-center items-center gap-x-2 text-sm font-medium text-gray-900 bg-primary-200 hover:text-primary-600 focus:outline-none focus:text-primary-600 rounded-lg disabled:opacity-50 disabled:pointer-events-none ${
                index === 0 ? 'active' : ''
              }`}
              aria-selected={false}
              role="tab"
              id={`${id}-control-${index}`}
              data-hs-tab={`#${id}-content-${index}`}
              aria-controls={`${id}-content-${index}`}
            >
              {title}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-3">
        {postGroupsData.map(({ posts }, index) => (
          <div
            key={`${id}-content-${index}`}
            id={`${id}-content-${index}`}
            className={index === 0 ? '' : 'hidden'}
            role="tabpanel"
            aria-labelledby={`${id}-control-${index}`}
          >
            <DataComponent classNames="lg:grid-cols-3" posts={posts} />
          </div>
        ))}
      </div>
    </div>
  )
}
