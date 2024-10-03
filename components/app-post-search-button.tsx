'use client'

import {
  ChangeEventHandler,
  FormEventHandler,
  useEffect,
  useRef,
  useState,
} from 'react'
import SearchIcon from '@/public/svgs/search.svg'
import { searchPosts } from '@/actions/search'
import classNames from 'classnames'
import { HSOverlay } from 'preline/preline'
import AppPostListItem from './app-post-list-item'

const PLACEHOLDER = 'Tìm kiếm...'

export default function AppPostSearchButton() {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const [posts, setPosts] = useState<PostParams[]>([])
  const [overlay, setOverlay] = useState<HSOverlay | null>(null)

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setInput(event.target.value)
  }

  const handleInputSubmit: FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault()
    const results = await searchPosts(input)
    setPosts(results.map((r) => r.item))
  }

  const openSearchModal = async () => {
    if (
      (overlay?.overlay && overlay.overlay.classList.contains('open')) ||
      !overlay?.overlay
    ) {
      return
    }

    overlay.open()
  }

  useEffect(() => {
    if (overlayRef.current && !overlay) {
      const initOverlay = async () => {
        const overlayElement = document.querySelector<HTMLElement>(
          `[data-hs-overlay="#json-example-using-modal-popup-with-shortcut-call-trigger"]`
        )
        if (overlayElement === null) {
          console.log('element not found')
          return
        }

        const { HSOverlay } = await import('preline/preline')

        const o = new HSOverlay(overlayElement)
        setOverlay(o)

        o.on('close', () => {
          setPosts([])
          setInput('')
        })
      }

      initOverlay()
    }
  }, [overlayRef, overlay])

  return (
    <div>
      {/* SearchBox Trigger */}
      <button
        type="button"
        className="hidden"
        aria-haspopup="dialog"
        aria-expanded="false"
        aria-controls="json-example-using-modal-popup-with-shortcut-call-trigger"
        data-hs-overlay="#json-example-using-modal-popup-with-shortcut-call-trigger"
      ></button>

      <button
        className="relative hover:cursor-pointer bg-white flex flex-row items-center space-x-2 p-2 hover:ring-2 ring-primary border"
        onClick={openSearchModal}
      >
        <SearchIcon className="shrink-0 size-4 text-gray-400" />
      </button>

      {/* SearchBox Modal */}
      <div
        ref={overlayRef}
        id="json-example-using-modal-popup-with-shortcut-call-trigger"
        className="hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden size-full fixed top-0 start-0 z-[80] opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none"
        role="dialog"
        tabIndex={-1}
        aria-labelledby="json-example-using-modal-popup-with-shortcut-call-trigger-label"
      >
        <div className="hs-overlay-open:opacity-100 hs-overlay-open:duration-500 opacity-0 transition-all sm:max-w-lg sm:w-full m-3 sm:mx-auto">
          <div className="flex flex-col bg-white border shadow-sm rounded-xl pointer-events-auto overflow-hidden">
            <div className="relative p-4 border-b border-gray-200">
              <form className="relative" onSubmit={handleInputSubmit}>
                <label
                  id="json-example-using-modal-popup-with-shortcut-call-trigger-label"
                  htmlFor="json-example-using-modal-popup-with-shortcut-call-trigger-input"
                  className="sr-only"
                >
                  Search input
                </label>
                <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none z-20 ps-3.5">
                  <SearchIcon className="shrink-0 size-4 text-gray-400" />
                </div>
                <input
                  id="json-example-using-modal-popup-with-shortcut-call-trigger-input"
                  className="py-3 ps-10 pe-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                  type="text"
                  role="search"
                  value={input}
                  autoFocus
                  onChange={handleInputChange}
                />
              </form>
            </div>

            <div className="max-h-[75vh] overflow-y-scroll rounded-sm relative w-full space-y-1 p-1">
              {posts.map((post, index) => (
                <div key={post.slug} className="h-[60px] w-full">
                  <AppPostListItem
                    post={post}
                    className={classNames(
                      index % 2 === 0 ? 'bg-primary-50' : 'bg-primary-100'
                    )}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
