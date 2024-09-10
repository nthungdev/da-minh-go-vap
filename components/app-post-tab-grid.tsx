import AppPostGrid from './app-post-grid'

const ALL_POSTS_CONTROL_LABEL = 'Tất cả'

interface AppPostTabGridProps {
  /** id should be provided when there are multiple AppPostTabGrid components on the same page */
  id?: string
  classNames?: string
  subCategories: {
    title: string
    posts: PostParams[]
  }[]
  allPostsLimit?: number
  component?: React.ElementType
}

export default function AppPostTabGrid(props: AppPostTabGridProps) {
  const {
    id = 'post-tab-grid',
    subCategories,
    classNames,
    allPostsLimit,
    component,
  } = props

  const DataComponent = component ? component : AppPostGrid

  const allPosts = subCategories
    .reduce((acc, { posts }) => [...acc, ...posts], [] as PostParams[])
    .toSorted((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, allPostsLimit)

  return (
    <div className={`${classNames}`}>
      <nav
        className="flex gap-x-4"
        aria-label="Tabs"
        role="tablist"
        aria-orientation="horizontal"
      >
        <button
          key={-1}
          type="button"
          className={`hs-tab-active:bg-primary-600 hs-tab-active:text-white hs-tab-active:hover:text-white py-3 px-4 text-center basis-0 grow inline-flex justify-center items-center gap-x-2 text-sm font-medium text-gray-900 bg-primary-200 hover:text-primary-600 focus:outline-none focus:text-primary-600 rounded-lg disabled:opacity-50 disabled:pointer-events-none active`}
          aria-selected={true}
          role="tab"
          id={`${id}-item-0`}
          data-hs-tab={`#${id}-0`}
          aria-controls={`${id}-0`}
        >
          {ALL_POSTS_CONTROL_LABEL}
        </button>

        {subCategories.map(({ title }, index) => (
          <button
            key={index}
            type="button"
            className={`hs-tab-active:bg-primary-600 hs-tab-active:text-white hs-tab-active:hover:text-white py-3 px-4 text-center basis-0 grow inline-flex justify-center items-center gap-x-2 text-sm font-medium text-gray-900 bg-primary-200 hover:text-primary-600 focus:outline-none focus:text-primary-600 rounded-lg disabled:opacity-50 disabled:pointer-events-none`}
            aria-selected={false}
            role="tab"
            id={`${id}-item-${index + 1}`}
            data-hs-tab={`#${id}-${index + 1}`}
            aria-controls={`${id}-${index + 1}`}
          >
            {title}
          </button>
        ))}
      </nav>

      <div className="mt-3">
        <div
          key={0}
          id={`${id}-0`}
          role="tabpanel"
          aria-labelledby={`${id}-item-0`}
        >
          <DataComponent classNames="lg:grid-cols-3" posts={allPosts} />
        </div>
        {subCategories.map(({ posts }, index) => (
          <div
            key={index}
            id={`${id}-${index + 1}`}
            className='hidden'
            role="tabpanel"
            aria-labelledby={`${id}-item-${index + 1}`}
          >
            <DataComponent classNames="lg:grid-cols-3" posts={posts} />
          </div>
        ))}
      </div>
    </div>
  )
}
