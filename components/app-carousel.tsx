import { Children, Fragment } from 'react'

interface AppCarouselProps {
  children: React.ReactNode
}

export default function AppCarousel(props: AppCarouselProps) {
  const { children } = props

  const hsCarouselData = {
    loadingClasses: 'opacity-0',
  }

  const childrenCount = Children.count(children)
  const hasMultipleChildren = childrenCount > 1

  return (
    <div data-hs-carousel={JSON.stringify(hsCarouselData)} className="relative h-full w-full">
      <div className="hs-carousel relative overflow-hidden w-full h-full bg-white">
        <div className="hs-carousel-body absolute top-0 bottom-0 start-0 flex flex-nowrap transition-transform duration-700 opacity-0">
          {Children.map(children, (child, index) => (
            <div key={index} className="hs-carousel-slide">
              {child}
            </div>
          ))}
        </div>
      </div>

      {hasMultipleChildren && (
        <Fragment>
          <button
            type="button"
            className="hs-carousel-prev hs-carousel:disabled:opacity-50 disabled:pointer-events-none absolute inset-y-0 start-0 inline-flex justify-center items-center w-[46px] h-full text-gray-800 hover:bg-gray-800/10 focus:outline-none focus:bg-gray-800/10 hover:text-white rounded-s-lg"
          >
            <span className="text-2xl" aria-hidden="true">
              <svg
                className="shrink-0 size-5"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6"></path>
              </svg>
            </span>
            <span className="sr-only">Previous</span>
          </button>
          <button
            type="button"
            className="hs-carousel-next hs-carousel:disabled:opacity-50 disabled:pointer-events-none absolute inset-y-0 end-0 inline-flex justify-center items-center w-[46px] h-full text-gray-800 hover:bg-gray-800/10 focus:outline-none focus:bg-gray-800/10 hover:text-white rounded-e-lg"
          >
            <span className="sr-only">Next</span>
            <span className="text-2xl" aria-hidden="true">
              <svg
                className="shrink-0 size-5"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6"></path>
              </svg>
            </span>
          </button>

          <div className="hs-carousel-pagination flex justify-center absolute bottom-3 start-0 end-0 space-x-2">
            {Children.map(children, (_, index) => (
              <span
                key={index}
                className="hs-carousel-active:bg-primary-700 hs-carousel-active:border-primary-700 size-3 border border-gray-400 rounded-full cursor-pointer dark:border-neutral-600 dark:hs-carousel-active:bg-primary-500 dark:hs-carousel-active:border-primary-500"
              ></span>
            ))}
          </div>
        </Fragment>
      )}
    </div>
  )
}
