"use client";

import {
  ChangeEventHandler,
  FormEvent,
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
import { cn } from "@/utils/common";
import { useLocale } from "next-intl";

enum ModalState {
  LOADING,
  LOADED,
  ERROR,
  EMPTY,
}

type SearchState =
  | { status: ModalState.LOADED; posts: AppPost[] }
  | { status: ModalState.EMPTY | ModalState.LOADING | ModalState.ERROR };

interface SearchModalProps {
  id: string;
  posts: AppPost[];
  input: string;
  state: ModalState;
  containerRef: RefObject<HTMLElement | null>;
  onInputSubmit: (event: FormEvent<HTMLFormElement>) => void;
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
            className="hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 pointer-events-none fixed start-0 top-0 z-80 hidden size-full overflow-x-hidden overflow-y-auto opacity-0 transition-all"
            role="dialog"
            tabIndex={-1}
            aria-labelledby={`${id}-label`}
          >
            <div className="hs-overlay-open:opacity-100 hs-overlay-open:duration-500 m-3 opacity-0 transition-all sm:mx-auto sm:w-full sm:max-w-lg">
              <div className="pointer-events-auto flex flex-col overflow-hidden rounded-xl border bg-white shadow-xs">
                <div className="relative border-b border-gray-200 p-4">
                  <form className="relative" onSubmit={onInputSubmit}>
                    <label
                      id={`${id}-label`}
                      htmlFor={`${id}-input`}
                      className="sr-only"
                    >
                      Search input
                    </label>
                    <div className="pointer-events-none absolute inset-y-0 start-0 z-20 flex items-center ps-3.5">
                      {/* <SearchIcon className="shrink-0 size-4 text-gray-400" /> */}
                      <Image
                        unoptimized
                        src={SearchIcon}
                        alt=""
                        className="size-4 shrink-0 text-gray-400"
                      />
                    </div>
                    <input
                      id={`${id}-input`}
                      className="focus:border-secondary focus:ring-secondary block w-full rounded-lg border-gray-200 py-3 ps-10 pe-4 text-sm disabled:pointer-events-none disabled:opacity-50"
                      type="text"
                      role="search"
                      value={input}
                      autoFocus
                      onChange={onInputChange}
                    />
                  </form>
                </div>

                <div className="relative max-h-[75vh] w-full overflow-y-auto rounded-xs">
                  {state === ModalState.LOADING && (
                    <div className="py-4 text-center">
                      <div
                        className="text-primary inline-block size-4 animate-spin rounded-full border-[3px] border-current border-t-transparent"
                        role="status"
                        aria-label="loading"
                      >
                        <span className="sr-only">Loading...</span>
                      </div>
                    </div>
                  )}

                  {state === ModalState.ERROR && (
                    <p role="alert" className="p-4">
                      Không thể tìm kiếm. Vui lòng thử lại.
                    </p>
                  )}
                  {state === ModalState.LOADED && posts.length === 0 && (
                    <p role="status" className="p-4">
                      Không tìm thấy bài viết.
                    </p>
                  )}
                  {state === ModalState.LOADED && (
                    <div className="space-y-1 p-1">
                      {posts.map((post, index) => (
                        <div key={post.slug} className="h-[60px] w-full">
                          <AppPostListItem
                            post={post}
                            className={cn(
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
  const locale = useLocale();
  const bodyRef = useRef<HTMLBodyElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const requestId = useRef(0);
  const [overlay, setOverlay] = useState<HSOverlay | null>(null);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [state, setState] = useState<SearchState>({ status: ModalState.EMPTY });

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
    const o = overlayInstance?.element;
    if (!o) return null;

    setOverlay(o);

    o.on("close", () => {
      requestId.current += 1;
      setState({ status: ModalState.EMPTY });
      setInput("");
    });

    return o;
  };

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setInput(event.target.value);
  };

  const handleInputSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const currentRequest = ++requestId.current;
    const query = input.trim();
    if (!query) {
      setState({ status: ModalState.EMPTY });
      return;
    }
    setState({ status: ModalState.LOADING });
    try {
      const results = await searchPosts(query, { locale });
      if (currentRequest === requestId.current) {
        setState({
          status: ModalState.LOADED,
          posts: results.map((r) => r.item),
        });
      }
    } catch {
      if (currentRequest === requestId.current)
        setState({ status: ModalState.ERROR });
    }
  };

  const openSearchModal = async () => {
    const overlay = await getOverlay();
    if (!overlay) {
      console.log("overlay not found");
      return;
    }
    overlay.open();
  };

  useEffect(() => {
    bodyRef.current = document.querySelector("body");
    forceUpdate();
    return () => {
      requestId.current += 1;
    };
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
        type="button"
        aria-label="Tìm kiếm"
        className="ring-primary relative flex flex-row items-center space-x-2 rounded-full border bg-white p-2 hover:cursor-pointer hover:ring-2"
        onClick={openSearchModal}
      >
        <Image
          unoptimized
          src={SearchIcon}
          alt=""
          className="size-4 shrink-0 text-gray-400"
        />
      </button>

      <SearchModal
        id={id}
        ref={overlayRef}
        containerRef={bodyRef}
        posts={state.status === ModalState.LOADED ? state.posts : []}
        input={input}
        state={state.status}
        onInputChange={handleInputChange}
        onInputSubmit={handleInputSubmit}
      />
    </div>
  );
}
