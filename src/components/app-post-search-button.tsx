"use client";

import {
  ChangeEventHandler,
  FormEvent,
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { searchPosts } from "@/actions/search";
import {
  SearchEmptyState,
  SearchErrorState,
  SearchIdleState,
  SearchSkeletonList,
} from "@/components/search/search-modal-states";
import { SearchResultCard } from "@/components/search/search-result-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AppPost } from "@/definitions";
import { Locale } from "@/i18n/config";
import { cn } from "@/utils/common";
import {
  addRecentSearch,
  parseRecentSearches,
  RECENT_SEARCHES_STORAGE_KEY,
  SearchTagOption,
} from "@/utils/search";

const SEARCH_DEBOUNCE_MS = 275;

// Tracks the currently open search modal across desktop/mobile navbar instances
// so global Cmd/Ctrl+K toggles a single dialog cleanly.
let activeSearchCloseHandler: (() => void) | null = null;

type SearchState =
  | { status: "idle"; query: string }
  | { status: "loading"; query: string; requestId: number }
  | {
      status: "loaded";
      query: string;
      submittedQuery: string;
      submittedTagId: string | null;
      results: AppPost[];
    }
  | {
      status: "error";
      query: string;
      submittedQuery: string;
      submittedTagId: string | null;
      message: string;
    };

type SearchAction =
  | { type: "SET_QUERY"; query: string }
  | { type: "SUBMIT"; requestId: number }
  | {
      type: "RESOLVE";
      requestId: number;
      submittedQuery: string;
      submittedTagId: string | null;
      results: AppPost[];
    }
  | {
      type: "REJECT";
      requestId: number;
      submittedQuery: string;
      submittedTagId: string | null;
      message: string;
    }
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
        submittedQuery: action.submittedQuery,
        submittedTagId: action.submittedTagId,
        results: action.results,
      };
    case "REJECT":
      if (state.status !== "loading" || state.requestId !== action.requestId) {
        return state;
      }
      return {
        status: "error",
        query: state.query,
        submittedQuery: action.submittedQuery,
        submittedTagId: action.submittedTagId,
        message: action.message,
      };
    case "RESET":
      return INITIAL_SEARCH_STATE;
  }
}

interface AppPostSearchButtonProps {
  id?: string;
  searchTags?: SearchTagOption[];
}

export default function AppPostSearchButton({
  id,
  searchTags = [],
}: AppPostSearchButtonProps) {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [state, dispatch] = useReducer(searchReducer, INITIAL_SEARCH_STATE);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tagLabelById = useMemo(
    () => new Map(searchTags.map((tag) => [tag.tagId, tag.label])),
    [searchTags],
  );

  const clearDebounce = useCallback(() => {
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  const persistRecentSearch = useCallback((queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const next = addRecentSearch(prev, trimmed);
      try {
        window.localStorage.setItem(
          RECENT_SEARCHES_STORAGE_KEY,
          JSON.stringify(next),
        );
      } catch {
        // Ignore storage quota or private-browsing errors
      }
      return next;
    });
  }, []);

  const handleClose = useCallback(() => {
    clearDebounce();
    requestIdRef.current += 1;
    setOpen(false);
    setSelectedTagId(null);
    setSelectedIndex(0);
    dispatch({ type: "RESET" });
  }, [clearDebounce]);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        handleClose();
      } else {
        setOpen(true);
      }
    },
    [handleClose],
  );

  // Sync recent searches when opening and register active close handler for Cmd/Ctrl+K
  useEffect(() => {
    if (!open) return;

    activeSearchCloseHandler = handleClose;
    try {
      const raw = window.localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
      setRecentSearches(parseRecentSearches(raw));
    } catch {
      setRecentSearches([]);
    }

    return () => {
      if (activeSearchCloseHandler === handleClose) {
        activeSearchCloseHandler = null;
      }
    };
  }, [open, handleClose]);

  // Global Cmd/Ctrl+K shortcut guarded so only a visible trigger opens
  useEffect(() => {
    const handleGlobalKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key.toLowerCase() !== "k") return;

      if (activeSearchCloseHandler) {
        event.preventDefault();
        activeSearchCloseHandler();
        return;
      }

      const triggerEl = triggerRef.current;
      if (triggerEl && triggerEl.getClientRects().length > 0) {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Clean up pending debounce timer on unmount
  useEffect(() => clearDebounce, [clearDebounce]);

  const executeSearch = useCallback(
    async (rawQuery: string, tagId: string | null) => {
      const trimmed = rawQuery.trim();
      if (!trimmed && !tagId) {
        requestIdRef.current += 1;
        dispatch({ type: "RESET" });
        setSelectedIndex(0);
        return;
      }

      const requestId = ++requestIdRef.current;
      dispatch({ type: "SUBMIT", requestId });
      setSelectedIndex(0);

      try {
        const results = await searchPosts(trimmed, {
          locale: locale as Locale,
          tagId: tagId ?? undefined,
        });
        dispatch({
          type: "RESOLVE",
          requestId,
          submittedQuery: trimmed,
          submittedTagId: tagId,
          results: results.map((r) => r.item),
        });
      } catch {
        dispatch({
          type: "REJECT",
          requestId,
          submittedQuery: trimmed,
          submittedTagId: tagId,
          message: t("search.error"),
        });
      }
    },
    [locale, t],
  );

  const handleClearQuery = useCallback(() => {
    clearDebounce();
    dispatch({ type: "SET_QUERY", query: "" });
    if (selectedTagId) {
      void executeSearch("", selectedTagId);
    } else {
      requestIdRef.current += 1;
      setSelectedIndex(0);
      dispatch({ type: "RESET" });
    }
    inputRef.current?.focus();
  }, [clearDebounce, executeSearch, selectedTagId]);

  const handleClearAll = useCallback(() => {
    clearDebounce();
    requestIdRef.current += 1;
    setSelectedTagId(null);
    setSelectedIndex(0);
    dispatch({ type: "RESET" });
    inputRef.current?.focus();
  }, [clearDebounce]);

  const handleSelectTag = useCallback(
    (tagId: string | null) => {
      clearDebounce();
      const nextTagId =
        tagId === null ? null : selectedTagId === tagId ? null : tagId;
      if (nextTagId === selectedTagId && !state.query.trim()) {
        inputRef.current?.focus();
        return;
      }
      setSelectedTagId(nextTagId);
      void executeSearch(state.query, nextTagId);
      inputRef.current?.focus();
    },
    [clearDebounce, executeSearch, selectedTagId, state.query],
  );

  const handlePickQuery = useCallback(
    (pickedQuery: string) => {
      clearDebounce();
      dispatch({ type: "SET_QUERY", query: pickedQuery });
      void executeSearch(pickedQuery, selectedTagId);
      inputRef.current?.focus();
    },
    [clearDebounce, executeSearch, selectedTagId],
  );

  const handleClearRecent = useCallback(() => {
    setRecentSearches([]);
    try {
      window.localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const nextQuery = event.target.value;
    dispatch({ type: "SET_QUERY", query: nextQuery });
    clearDebounce();

    if (!nextQuery.trim()) {
      if (selectedTagId) {
        void executeSearch("", selectedTagId);
      } else {
        requestIdRef.current += 1;
        setSelectedIndex(0);
        dispatch({ type: "RESET" });
      }
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      void executeSearch(nextQuery, selectedTagId);
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearDebounce();

    const trimmed = state.query.trim();
    if (!trimmed && !selectedTagId) {
      handleClearAll();
      return;
    }

    if (
      state.status === "loaded" &&
      state.submittedQuery === trimmed &&
      state.submittedTagId === selectedTagId &&
      state.results[selectedIndex]
    ) {
      const selectedPost = state.results[selectedIndex];
      persistRecentSearch(trimmed);
      handleClose();
      router.push(`/posts/${selectedPost.slug}`);
      return;
    }

    void executeSearch(trimmed, selectedTagId);
  };

  const handleInputKeyDown: KeyboardEventHandler<HTMLInputElement> = (
    event,
  ) => {
    if (state.status !== "loaded" || state.results.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % state.results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex(
        (prev) => (prev - 1 + state.results.length) % state.results.length,
      );
    }
  };

  const inputId = id ? `${id}-input` : "search-input";
  const labelId = id ? `${id}-label` : "search-input-label";
  const isAllActive = selectedTagId === null;
  const submittedTagLabel =
    (state.status === "loaded" || state.status === "error") &&
    state.submittedTagId
      ? (tagLabelById.get(state.submittedTagId) ?? null)
      : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        ref={triggerRef}
        className={cn(
          "ring-primary relative flex flex-row items-center space-x-2 rounded-full border bg-white p-2 text-stone-600 transition-shadow hover:cursor-pointer hover:ring-2 motion-reduce:transition-none",
          "focus-visible:ring-primary-700 focus-visible:ring-2 focus-visible:outline-none",
        )}
        aria-label={t("search.label")}
      >
        <Search className="size-4 shrink-0 text-stone-500" aria-hidden="true" />
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className={cn(
          "top-[6vh] left-1/2 flex max-h-[82vh] w-[calc(100vw-1.5rem)] max-w-[680px] -translate-x-1/2 translate-y-0 flex-col gap-0 overflow-hidden rounded-[20px] border border-[#e8e2d8] bg-[#faf8f5] p-0 shadow-[0_28px_64px_-16px_rgba(24,24,27,0.32)] sm:top-[8vh] sm:max-w-[680px]",
          "motion-reduce:transition-none",
        )}
      >
        <DialogTitle className="sr-only">{t("search.label")}</DialogTitle>
        <DialogDescription className="sr-only">
          {t("search.placeholder")}
        </DialogDescription>

        {/* Editorial Header */}
        <div className="border-b border-[#e8e2d8] bg-white px-5 pt-4 pb-3.5 sm:px-6 sm:pt-5">
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <span className="text-primary-700 text-[11px] font-extrabold tracking-[0.1em] uppercase">
              {t("search.kicker")}
            </span>
            <button
              type="button"
              onClick={handleClose}
              aria-label={t("common.close")}
              className={cn(
                "inline-flex size-8 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 motion-reduce:transition-none",
                "focus-visible:ring-primary-700 focus-visible:ring-2 focus-visible:outline-none",
              )}
            >
              <X className="size-4.5" aria-hidden="true" />
            </button>
          </div>

          <form
            role="search"
            onSubmit={handleFormSubmit}
            className="border-primary-700 flex items-center gap-3 border-b-2 pb-2.5"
          >
            <label id={labelId} htmlFor={inputId} className="sr-only">
              {t("search.label")}
            </label>
            <Search
              className="text-primary-700 size-5 shrink-0"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              id={inputId}
              type="search"
              enterKeyHint="search"
              autoFocus
              autoComplete="off"
              value={state.query}
              placeholder={t("search.placeholder")}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              className="font-lora flex-1 border-0 bg-transparent p-0 text-lg text-stone-900 placeholder:text-stone-400 placeholder:italic focus:ring-0 focus:outline-none sm:text-xl [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
            />
            {state.query.length > 0 && (
              <button
                type="button"
                onClick={handleClearQuery}
                aria-label={t("search.clear")}
                className={cn(
                  "inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-stone-200/75 text-stone-600 transition-colors hover:bg-stone-300/80 hover:text-stone-900 motion-reduce:transition-none",
                  "focus-visible:ring-primary-700 focus-visible:ring-2 focus-visible:outline-none",
                )}
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            )}
          </form>

          {/* Tag Quick-Filter Pills */}
          {searchTags.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto pt-3 pb-0.5">
              <button
                type="button"
                onClick={() => handleSelectTag(null)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-bold whitespace-nowrap transition-colors motion-reduce:transition-none",
                  "focus-visible:ring-primary-700 focus-visible:ring-2 focus-visible:outline-none",
                  isAllActive
                    ? "border-primary-700 bg-primary-700 text-white"
                    : "hover:border-primary-700 hover:text-primary-800 border-[#e8e2d8] bg-[#faf8f5] text-stone-600",
                )}
              >
                {t("search.allTopics")}
              </button>
              {searchTags.map((tag) => {
                const isActive = selectedTagId === tag.tagId;
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleSelectTag(tag.tagId)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-bold whitespace-nowrap transition-colors motion-reduce:transition-none",
                      "focus-visible:ring-primary-700 focus-visible:ring-2 focus-visible:outline-none",
                      isActive
                        ? "border-primary-700 bg-primary-700 text-white"
                        : "hover:border-primary-700 hover:text-primary-800 border-[#e8e2d8] bg-[#faf8f5] text-stone-600",
                    )}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Scrollable Editorial Body */}
        <div
          className="min-h-0 flex-1 overflow-y-auto px-5 py-3 sm:px-6 sm:pb-5"
          aria-live="polite"
        >
          {state.status === "idle" && (
            <SearchIdleState
              recentSearches={recentSearches}
              onPickQuery={handlePickQuery}
              onClearRecent={handleClearRecent}
            />
          )}

          {state.status === "loading" && <SearchSkeletonList />}

          {state.status === "error" && (
            <SearchErrorState
              message={state.message}
              onRetry={() =>
                void executeSearch(state.submittedQuery, state.submittedTagId)
              }
            />
          )}

          {state.status === "loaded" && state.results.length === 0 && (
            <SearchEmptyState
              query={state.submittedQuery}
              tagLabel={submittedTagLabel}
              onClear={handleClearAll}
            />
          )}

          {state.status === "loaded" && state.results.length > 0 && (
            <div>
              <div className="pt-1 pb-1 text-xs font-bold text-stone-500">
                {state.submittedQuery && submittedTagLabel
                  ? t("search.resultsCountWithTag", {
                      count: state.results.length,
                      query: state.submittedQuery,
                      tag: submittedTagLabel,
                    })
                  : submittedTagLabel
                    ? t("search.resultsCountByTag", {
                        count: state.results.length,
                        tag: submittedTagLabel,
                      })
                    : t("search.resultsCount", {
                        count: state.results.length,
                        query: state.submittedQuery,
                      })}
              </div>
              <div role="listbox" aria-label={t("search.label")}>
                {state.results.map((post, index) => (
                  <SearchResultCard
                    key={post.slug}
                    post={post}
                    query={state.submittedQuery}
                    locale={locale}
                    isSelected={index === selectedIndex}
                    fallbackLabel={t("search.articleFallback")}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onSelect={() => {
                      persistRecentSearch(state.submittedQuery);
                      handleClose();
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Keyboard Hints Footer */}
        <div className="hidden items-center justify-between border-t border-[#e8e2d8] bg-white/80 px-6 py-2.5 text-[11.5px] font-medium text-stone-500 sm:flex">
          <div className="flex items-center gap-3.5">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-b-2 border-stone-300 bg-stone-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-stone-600">
                ↑
              </kbd>
              <kbd className="rounded border border-b-2 border-stone-300 bg-stone-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-stone-600">
                ↓
              </kbd>
              <span>{t("search.hintNavigate")}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-b-2 border-stone-300 bg-stone-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-stone-600">
                ↵
              </kbd>
              <span>{t("search.hintOpen")}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-b-2 border-stone-300 bg-stone-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-stone-600">
                Esc
              </kbd>
              <span>{t("search.hintClose")}</span>
            </span>
          </div>
          <span>{t("search.hintDiacritics")}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
