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

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedGroup = postGroupsData.find(
      (group) => group.title === event.target.value
    )

    if (selectedGroup) {
      const controls = document.querySelectorAll<HTMLButtonElement>(
        `#${id} nav button`
      )
      const control = controls[postGroupsData.indexOf(selectedGroup)]

      if (control) {
        control.click()
      }
    }
  }

  return (
    <div className={`${classNames}`} id={id}>
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
          className="hidden lg:flex gap-x-4 bg-primary-500 p-4"
          aria-label="Tabs"
          role="tablist"
          aria-orientation="horizontal"
        >
          {postGroupsData.map(({ title }, index) => (
            <button
              key={`${id}-control-${index}`}
              type="button"
              className={`hs-tab-active:bg-primary-700 hs-tab-active:text-white hs-tab-active:hover:text-white py-2 px-3 text-center basis-0 grow inline-flex justify-center items-center gap-x-2 text-sm font-medium text-gray-900 bg-primary-200 hover:text-primary-700 focus:outline-none focus:text-primary-700 disabled:opacity-50 disabled:pointer-events-none ${
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

      <div className="p-4 bg-primary-200">
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
