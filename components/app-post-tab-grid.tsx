import AppPostGrid from './app-post-grid'

interface AppPostTabGridProps {
  /** id should be provided when there are multiple AppPostTabGrid components on the same page */
  id?: string
  classNames?: string
  subCategories: {
    title: string
    posts: PostParams[]
  }[]
  component?: React.ElementType
}

export default function AppPostTabGrid(props: AppPostTabGridProps) {
  const { id = 'post-tab-grid', subCategories, classNames, component } = props
  const DataComponent = component ? component : AppPostGrid

  return (
    <div className={`${classNames}`}>
      <nav
        className="flex gap-x-4"
        aria-label="Tabs"
        role="tablist"
        aria-orientation="horizontal"
      >
        {subCategories.map(({ title }, index) => (
          <button
            key={index}
            type="button"
            className={`hs-tab-active:bg-primary-600 hs-tab-active:text-white hs-tab-active:hover:text-white py-3 px-4 text-center basis-0 grow inline-flex justify-center items-center gap-x-2 text-sm font-medium text-gray-900 bg-primary-200 hover:text-primary-600 focus:outline-none focus:text-primary-600 rounded-lg disabled:opacity-50 disabled:pointer-events-none ${
              index === 0 ? 'active' : ''
            }`}
            aria-selected={index === 0}
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
        {subCategories.map(({ posts }, index) => (
          <div
            key={index}
            id={`${id}-${index + 1}`}
            className={index === 0 ? '' : 'hidden'}
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
