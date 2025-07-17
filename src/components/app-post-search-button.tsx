"use client";

import {
  ChangeEventHandler,
  FormEventHandler,
  forwardRef,
  RefObject,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import SearchIcon from "@/public/svgs/search.svg";
import { searchPosts } from "@/actions/search";
import { HSOverlay, ICollectionItem } from "preline/preline";
import AppPostListItem from "./app-post-list-item";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AppPost } from "@/definitions";
import { twMerge } from "tailwind-merge";

const PLACEHOLDER = "Tìm kiếm...";

enum ModalState {
  LOADING,
  LOADED,
  ERROR,
  EMPTY,
}

interface SearchModalProps {
  id: string;
  posts: AppPost[];
  input: string;
  state: ModalState;
  containerRef: RefObject<HTMLElement | null>;
  onInputSubmit: FormEventHandler<HTMLFormElement>;
  onInputChange: ChangeEventHandler<HTMLInputElement>;
}

// eslint-disable-next-line react/display-name
const SearchModal = forwardRef<HTMLDivElement, SearchModalProps>(
  (props, ref) => {
    const {
      id,
      posts,
      input,
      state,
      containerRef,
      onInputChange,
      onInputSubmit,
    } = props;

    return containerRef.current
      ? createPortal(
          <div
            ref={ref}
            id={id}
            className="hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden size-full fixed top-0 start-0 z-[80] opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none"
            role="dialog"
            tabIndex={-1}
            aria-labelledby={`${id}-label`}
          >
            <div className="hs-overlay-open:opacity-100 hs-overlay-open:duration-500 opacity-0 transition-all sm:max-w-lg sm:w-full m-3 sm:mx-auto">
              <div className="flex flex-col bg-white border shadow-sm rounded-xl pointer-events-auto overflow-hidden">
                <div className="relative p-4 border-b border-gray-200">
                  <form className="relative" onSubmit={onInputSubmit}>
                    <label
                      id={`${id}-label`}
                      htmlFor={`${id}-input`}
                      className="sr-only"
                    >
                      Search input
                    </label>
                    <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none z-20 ps-3.5">
                      {/* <SearchIcon className="shrink-0 size-4 text-gray-400" /> */}
                      <Image
                        src={SearchIcon}
                        alt=""
                        className="shrink-0 size-4 text-gray-400"
                      />
                    </div>
                    <input
                      id={`${id}-input`}
                      className="py-3 ps-10 pe-4 block w-full border-gray-200 rounded-lg text-sm focus:border-secondary          focus:ring-secondary disabled:opacity-50 disabled:pointer-events-none"
                      type="text"
                      role="search"
                      value={input}
                      autoFocus
                      onChange={onInputChange}
                    />
                  </form>
                </div>

                <div className="max-h-[75vh] overflow-y-scroll rounded-sm relative w-full">
                  {state === ModalState.LOADING && (
                    <div className="py-4 text-center">
                      <div
                        className="animate-spin inline-block size-4 border-[3px] border-current border-t-transparent text-primary rounded-full"
                        role="status"
                        aria-label="loading"
                      >
                        <span className="sr-only">Loading...</span>
                      </div>
                    </div>
                  )}

                  {state === ModalState.LOADED && (
                    <div className="p-1 space-y-1">
                      {posts.map((post, index) => (
                        <div key={post.slug} className="h-[60px] w-full">
                          <AppPostListItem
                            post={post}
                            className={twMerge(
                              index % 2 === 0
                                ? "bg-primary-50"
                                : "bg-primary-100",
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>,
          containerRef.current,
        )
      : null;
  },
);

export default function AppPostSearchButton({ id }: { id: string }) {
  const bodyRef = useRef<HTMLBodyElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [posts, setPosts] = useState<AppPost[]>([]);
  const [overlay, setOverlay] = useState<HSOverlay | null>(null);
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);
  const [state, setState] = useState(ModalState.EMPTY);

  const getOverlay = async () => {
    if (overlay) {
      return overlay;
    }

    const overlayElement = document.querySelector<HTMLElement>(
      `[data-hs-overlay="#${id}"]`,
    );
    if (overlayElement === null) {
      console.log("element not found");
      return null;
    }

    const { HSOverlay } = await import("preline/preline");

    const overlayInstance = HSOverlay.getInstance(
      overlayElement,
      true,
    ) as ICollectionItem<HSOverlay>;
    const o = overlayInstance.element;

    setOverlay(o);

    o.on("close", () => {
      setPosts([]);
      setInput("");
    });

    return o;
  };

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setInput(event.target.value);
  };

  const handleInputSubmit: FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();
    setState(ModalState.LOADING);
    const results = await searchPosts(input);
    setPosts(results.map((r) => r.item));
    setState(ModalState.LOADED);
  };

  const openSearchModal = async () => {
    const overlay = await getOverlay();
    if (!overlay) {
      console.log("overlay not found");
      return;
    }
    overlay.open();
    overlay.on("close", () => {
      setPosts([]);
      setInput("");
    });
  };

  useEffect(() => {
    bodyRef.current = document.querySelector("body");
    forceUpdate();
  }, []);

  return (
    <div>
      {/* SearchBox Trigger */}
      <button
        type="button"
        className="hidden"
        aria-haspopup="dialog"
        aria-expanded="false"
        aria-controls={id}
        data-hs-overlay={`#${id}`}
      ></button>

      <button
        className="relative hover:cursor-pointer bg-white flex flex-row items-center space-x-2 p-2 hover:ring-2 ring-primary border rounded-full"
        onClick={openSearchModal}
      >
        <Image
          src={SearchIcon}
          alt=""
          className="shrink-0 size-4 text-gray-400"
        />
      </button>

      <SearchModal
        id={id}
        ref={overlayRef}
        containerRef={bodyRef}
        posts={posts}
        input={input}
        state={state}
        onInputChange={handleInputChange}
        onInputSubmit={handleInputSubmit}
      />
    </div>
  );
}
