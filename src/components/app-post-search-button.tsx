"use client";

import { ChangeEventHandler, FormEvent, useRef, useState } from "react";
import SearchIcon from "@/public/svgs/search.svg";
import { searchPosts } from "@/actions/search";
import AppPostListItem from "./app-post-list-item";
import Image from "next/image";
import { AppPost } from "@/definitions";
import { cn } from "@/utils/common";
import { useLocale } from "next-intl";
import { Locale } from "@/i18n/config";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

enum ModalState {
  EMPTY,
  LOADING,
  LOADED,
  ERROR,
}

export default function AppPostSearchButton({ id }: { id?: string }) {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [posts, setPosts] = useState<AppPost[]>([]);
  const [state, setState] = useState(ModalState.EMPTY);
  const searchIdRef = useRef(0);

  const handleClose = () => {
    searchIdRef.current += 1;
    setOpen(false);
    setPosts([]);
    setInput("");
    setState(ModalState.EMPTY);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      handleClose();
    } else {
      setOpen(true);
    }
  };

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setInput(event.target.value);
  };

  const handleInputSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = input.trim();
    if (state === ModalState.LOADING || !query) return;

    const currentSearchId = ++searchIdRef.current;
    setState(ModalState.LOADING);
    try {
      const results = await searchPosts(query, {
        locale: locale as Locale,
      });
      if (searchIdRef.current !== currentSearchId) return;
      setPosts(results.map((r) => r.item));
      setState(ModalState.LOADED);
    } catch {
      if (searchIdRef.current !== currentSearchId) return;
      setState(ModalState.ERROR);
    }
  };

  const inputId = id ? `${id}-input` : "search-input";
  const labelId = id ? `${id}-label` : "search-input-label";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        className="ring-primary relative flex flex-row items-center space-x-2 rounded-full border bg-white p-2 hover:cursor-pointer hover:ring-2"
        aria-label="Search"
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
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription className="sr-only">
          Search for posts and articles
        </DialogDescription>

        <div className="relative border-b border-gray-200 p-4">
          <form role="search" className="relative" onSubmit={handleInputSubmit}>
            <label id={labelId} htmlFor={inputId} className="sr-only">
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
              id={inputId}
              className="focus:border-secondary focus:ring-secondary block w-full rounded-lg border-gray-200 py-3 ps-10 pe-4 text-sm disabled:pointer-events-none disabled:opacity-50"
              type="text"
              value={input}
              autoFocus
              placeholder={
                locale === "vi" ? "Tìm kiếm bài viết..." : "Search posts..."
              }
              onChange={handleInputChange}
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
            <div className="py-6 text-center text-sm text-red-500">
              {locale === "vi"
                ? "Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau."
                : "An error occurred while searching. Please try again later."}
            </div>
          )}

          {state === ModalState.LOADED && (
            <div className="space-y-1 p-1">
              {posts.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-500">
                  {locale === "vi"
                    ? "Không tìm thấy kết quả"
                    : "No results found"}
                </div>
              ) : (
                posts.map((post, index) => (
                  <div
                    key={post.slug}
                    className="h-[60px] w-full"
                    onClick={handleClose}
                  >
                    <AppPostListItem
                      post={post}
                      className={cn(
                        index % 2 === 0 ? "bg-primary-50" : "bg-primary-100",
                      )}
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
