"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  type ChangeEventHandler,
  type FormEvent,
  useReducer,
  useRef,
  useState,
} from "react";
import { searchPosts } from "@/actions/search";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { AppPost } from "@/definitions";
import type { Locale } from "@/i18n/config";
import SearchIcon from "@/public/svgs/search.svg";
import { cn } from "@/utils/common";
import AppPostListItem from "./app-post-list-item";

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

export default function AppPostSearchButton({ id }: { id?: string }) {
  const locale = useLocale();
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [state, dispatch] = useReducer(searchReducer, INITIAL_SEARCH_STATE);
  const requestIdRef = useRef(0);

  const handleClose = () => {
    requestIdRef.current += 1;
    setOpen(false);
    dispatch({ type: "RESET" });
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      handleClose();
    } else {
      setOpen(true);
    }
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
    if (state.status === "loading") return;

    const requestId = ++requestIdRef.current;
    dispatch({ type: "SUBMIT", requestId });

    try {
      const results = await searchPosts(trimmed, {
        locale: locale as Locale,
      });
      dispatch({
        type: "RESOLVE",
        requestId,
        results: results.map((r) => r.item),
      });
    } catch {
      dispatch({
        type: "REJECT",
        requestId,
        message: t("search.error"),
      });
    }
  };

  const inputId = id ? `${id}-input` : "search-input";
  const labelId = id ? `${id}-label` : "search-input-label";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        className="ring-primary relative flex flex-row items-center space-x-2 rounded-full border bg-white p-2 hover:cursor-pointer hover:ring-2"
        aria-label={t("search.label")}
      >
        <Image
          unoptimized
          src={SearchIcon}
          alt=""
          className="size-4 shrink-0 text-gray-400"
        />
      </DialogTrigger>

      <DialogContent
        className="gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{t("search.label")}</DialogTitle>
        <DialogDescription className="sr-only">
          {t("search.placeholder")}
        </DialogDescription>

        <div className="relative border-b border-gray-200 p-4">
          <search>
            <form className="relative" onSubmit={handleInputSubmit}>
              <label id={labelId} htmlFor={inputId} className="sr-only">
                {t("search.label")}
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
                id={inputId}
                className="focus:border-secondary focus:ring-secondary block w-full rounded-lg border-gray-200 py-3 ps-10 pe-4 text-sm disabled:pointer-events-none disabled:opacity-50"
                type="text"
                value={state.query}
                autoFocus
                placeholder={t("search.placeholder")}
                onChange={handleInputChange}
              />
            </form>
          </search>
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
                aria-label={t("common.loading")}
              >
                <span className="sr-only">{t("common.loading")}</span>
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
              {t("search.empty")}
            </p>
          )}

          {state.status === "loaded" && state.results.length > 0 && (
            <div className="space-y-1 p-1">
              {state.results.map((post, index) => (
                <div
                  key={post.slug}
                  className="h-[60px] w-full"
                  onClickCapture={handleClose}
                >
                  <AppPostListItem
                    post={post}
                    className={cn(
                      index % 2 === 0 ? "bg-primary-50" : "bg-primary-100",
                    )}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
