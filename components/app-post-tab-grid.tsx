import AppPostGrid from './app-post-grid'

interface AppPostTabGridProps {
  classNames?: string
  category: {
    title: string
    subCategories: {
      title: string
      posts: PostParams[]
    }[]
  }
}

export default function AppPostTabGrid({
  category,
  classNames,
}: AppPostTabGridProps) {
  const { subCategories } = category
  console.log({ category })

  return (
    <div className={`${classNames}`}>
      <nav
        className="flex gap-x-4 lg:gap-x-8"
        aria-label="Tabs"
        role="tablist"
        aria-orientation="horizontal"
      >
        {subCategories.map(({ title }, index) => (
          <button
            key={index}
            type="button"
            className={`hs-tab-active:bg-primary-600 hs-tab-active:text-white hs-tab-active:hover:text-white hs-tab-active:dark:text-white py-3 px-4 text-center basis-0 grow inline-flex justify-center items-center gap-x-2 bg-transparent text-sm font-medium text-gray-500 hover:text-primary-600 focus:outline-none focus:text-primary-600 rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-neutral-300 dark:focus:text-neutral-300 ${index === 0 ? 'active' : ''}`}
            aria-selected={index === 0}
            role="tab"
            id={`equal-width-elements-item-${index + 1}`}
            data-hs-tab={`#equal-width-elements-${index + 1}`}
            aria-controls={`equal-width-elements-${index + 1}`}
          >
            {title}
          </button>
        ))}
      </nav>

      <div className="mt-3">
        {subCategories.map(({ posts }, index) => (
          <div
            key={index}
            id={`equal-width-elements-${index + 1}`}
            className={index === 0 ? '' : 'hidden'}
            role="tabpanel"
            aria-labelledby={`equal-width-elements-item-${index + 1}`}
          >
            <AppPostGrid classNames='lg:grid-cols-3' posts={posts} />
          </div>
        ))}
      </div>
    </div>
  )
}
