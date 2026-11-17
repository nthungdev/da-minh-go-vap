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
import { Locale } from "@/i18n/config";
import { useLocale } from "next-intl";

type SearchState =
  | { status: "idle"; query: string }
  | { status: "loading"; query: string; requestId: number }
  | { status: "loaded"; query: string; results: AppPost[] }
  | { status: "error"; query: string; message: string };

type SearchAction =
  | { type: "SET_QUERY"; query: string }
  | { type: "SUBMIT"; requestId: number }
  | { type: "RESOLVE"; requestId: number; results: AppPost[] }
  | { type: "REJECT"; requestId: number; message: string }
  | { type: "RESET" };

const INITIAL_SEARCH_STATE: SearchState = {
  status: "idle",
  query: "",
};

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case "SET_QUERY":
      if (state.status === "error") {
        return { status: "idle", query: action.query };
      }
      return { ...state, query: action.query };
    case "SUBMIT":
      return {
        status: "loading",
        query: state.query,
        requestId: action.requestId,
      };
    case "RESOLVE":
      if (state.status !== "loading" || state.requestId !== action.requestId) {
        return state;
      }
      return {
        status: "loaded",
        query: state.query,
        results: action.results,
      };
    case "REJECT":
      if (state.status !== "loading" || state.requestId !== action.requestId) {
        return state;
      }
      return {
        status: "error",
        query: state.query,
        message: action.message,
      };
    case "RESET":
      return INITIAL_SEARCH_STATE;
  }
}

const searchLabels: Record<
  Locale,
  { empty: string; error: string; placeholder: string }
> = {
  vi: {
    empty: "Không tìm thấy bài viết nào.",
    error: "Không thể tìm kiếm lúc này. Vui lòng thử lại.",
    placeholder: "Tìm kiếm bài viết...",
  },
  en: {
    empty: "No posts found.",
    error: "Unable to search right now. Please try again.",
    placeholder: "Search posts...",
  },
};

interface SearchModalProps {
  id: string;
  state: SearchState;
  locale: Locale;
  containerRef: RefObject<HTMLElement | null>;
  onInputSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onInputChange: ChangeEventHandler<HTMLInputElement>;
}

// eslint-disable-next-line react/display-name
const SearchModal = forwardRef<HTMLDivElement, SearchModalProps>(
  (props, ref) => {
    const { id, state, locale, containerRef, onInputChange, onInputSubmit } =
      props;
    const labels = searchLabels[locale];

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
                      placeholder={labels.placeholder}
                      value={state.query}
                      autoFocus
                      onChange={onInputChange}
                    />
                  </form>
                </div>

                <div
                  className="relative max-h-[75vh] w-full overflow-y-auto rounded-xs"
                  aria-live="polite"
                >
                  {state.status === "loading" && (
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

                  {state.status === "error" && (
                    <p
                      role="alert"
                      className="px-4 py-6 text-center text-sm text-red-600"
                    >
                      {state.message}
                    </p>
                  )}

                  {state.status === "loaded" && state.results.length === 0 && (
                    <p className="px-4 py-6 text-center text-sm text-gray-500">
                      {labels.empty}
                    </p>
                  )}

                  {state.status === "loaded" && state.results.length > 0 && (
                    <div className="space-y-1 p-1">
                      {state.results.map((post, index) => (
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
  const locale = useLocale() as Locale;
  const bodyRef = useRef<HTMLBodyElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);
  const [overlay, setOverlay] = useState<HSOverlay | null>(null);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [state, dispatch] = useReducer(searchReducer, INITIAL_SEARCH_STATE);

  const getOverlay = async () => {
    if (overlay) {
      return overlay;
    }

    const overlayElement = document.querySelector<HTMLElement>(
      `[data-hs-overlay="#${id}"]`,
    );
    if (overlayElement === null) {
      return null;
    }

    const { HSOverlay } = await import("preline/preline");

    const overlayInstance = HSOverlay.getInstance(
      overlayElement,
      true,
    ) as ICollectionItem<HSOverlay>;
    const o = overlayInstance.element;

    o.on("close", () => {
      // Invalidate any in-flight search request and reset modal state
      requestIdRef.current += 1;
      dispatch({ type: "RESET" });
    });

    setOverlay(o);
    return o;
  };

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    dispatch({ type: "SET_QUERY", query: event.target.value });
  };

  const handleInputSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = state.query.trim();
    if (!trimmed) {
      dispatch({ type: "RESET" });
      return;
    }

    const requestId = ++requestIdRef.current;
    dispatch({ type: "SUBMIT", requestId });

    try {
      const results = await searchPosts(trimmed, { locale });
      dispatch({
        type: "RESOLVE",
        requestId,
        results: results.map((r) => r.item),
      });
    } catch {
      dispatch({
        type: "REJECT",
        requestId,
        message: searchLabels[locale].error,
      });
    }
  };

  const openSearchModal = async () => {
    const o = await getOverlay();
    if (!o) return;
    o.open();
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
        state={state}
        locale={locale}
        onInputChange={handleInputChange}
        onInputSubmit={handleInputSubmit}
      />
    </div>
  );
}
