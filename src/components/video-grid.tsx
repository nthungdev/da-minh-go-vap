"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  type RefObject,
  Suspense,
  useCallback,
  useEffect,
  useRef,
} from "react";
import PaginationPanel from "@/components/pagination-panel";
import { cn } from "@/utils/common";
import {
  DEFAULT_VIDEO_PAGE_SIZE,
  extractYoutubeId,
  isYoutubeShort,
  normalizeVideoPageSize,
  paginateVideos,
  resolveVideoPage,
  type VideoItem,
} from "@/utils/video-grid";

export { extractYoutubeId, isYoutubeShort, type VideoItem };

export interface VideoGridProps {
  title?: string;
  videos?: VideoItem[];
  pageSize?: number;
  queryParamName?: string;
  className?: string;
}

interface VideoGridBodyProps {
  title?: string;
  videos: VideoItem[];
  totalPages: number;
  activePage: number;
  className?: string;
  containerRef?: RefObject<HTMLElement | null>;
  onPageChange?: (page: number) => void;
}

function scrollContainerIntoViewIfAboveFold(
  container: HTMLElement | null,
): void {
  if (!container) return;
  const rect = container.getBoundingClientRect();
  if (rect.top < 0) {
    container.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

function VideoGridBody({
  title,
  videos,
  totalPages,
  activePage,
  className,
  containerRef,
  onPageChange,
}: VideoGridBodyProps) {
  return (
    <section ref={containerRef} className={cn("my-8 w-full", className)}>
      {title && (
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
          {title}
        </h2>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {videos.map((video, index) => {
          const isShort =
            video.type === "youtube" &&
            isYoutubeShort(video.url, video.isShort ?? false);
          const youtubeId =
            video.type === "youtube" ? extractYoutubeId(video.url) : null;

          return (
            <div
              key={video.id || `${video.url}-${index}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
            >
              <div
                className={cn(
                  "relative w-full overflow-hidden bg-black",
                  isShort ? "aspect-[9/16]" : "aspect-video",
                )}
              >
                {video.type === "youtube" && youtubeId ? (
                  <iframe
                    className="h-full w-full border-0"
                    src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                  />
                ) : video.type === "facebook" ? (
                  <iframe
                    className="h-full w-full border-0"
                    src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
                      video.url,
                    )}&show_text=0`}
                    title={video.title}
                    allow="encrypted-media"
                    allowFullScreen
                    loading="lazy"
                  />
                ) : null}
              </div>

              {video.title && (
                <div className="flex flex-1 flex-col p-3">
                  <h3 className="line-clamp-2 text-center text-sm font-medium text-gray-900 group-hover:text-primary-600">
                    {video.title}
                  </h3>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <PaginationPanel
          className="mt-6 md:mt-8"
          totalPages={totalPages}
          page={activePage}
          onPageChange={onPageChange}
        />
      )}
    </section>
  );
}

function VideoGridContent({
  title,
  videos = [],
  pageSize = DEFAULT_VIDEO_PAGE_SIZE,
  queryParamName = "page",
  className,
}: VideoGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLElement>(null);
  const pendingScrollRef = useRef(false);

  const safePageSize = normalizeVideoPageSize(pageSize);
  const totalPages = Math.ceil(videos.length / safePageSize);
  const activePage = resolveVideoPage(
    searchParams?.get(queryParamName),
    totalPages,
  );
  const { items: visibleVideos } = paginateVideos(
    videos,
    activePage,
    safePageSize,
  );

  useEffect(() => {
    if (activePage < 1 || !pendingScrollRef.current) return;
    pendingScrollRef.current = false;
    scrollContainerIntoViewIfAboveFold(containerRef.current);
  }, [activePage]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      pendingScrollRef.current = true;
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      if (newPage <= 1) {
        params.delete(queryParamName);
      } else {
        params.set(queryParamName, newPage.toString());
      }
      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [searchParams, queryParamName, pathname, router],
  );

  return (
    <VideoGridBody
      title={title}
      videos={visibleVideos}
      totalPages={totalPages}
      activePage={activePage}
      className={className}
      containerRef={containerRef}
      onPageChange={handlePageChange}
    />
  );
}

/**
 * Renders a responsive, paginated grid of embedded videos, supporting
 * YouTube Shorts, standard YouTube videos, and Facebook embeds.
 */
export default function VideoGrid(props: VideoGridProps) {
  const { title, videos = [], pageSize, className } = props;

  if (!videos || videos.length === 0) {
    return null;
  }

  const fallbackPage = paginateVideos(videos, 1, pageSize);

  return (
    <Suspense
      fallback={
        <VideoGridBody
          title={title}
          videos={fallbackPage.items}
          totalPages={fallbackPage.totalPages}
          activePage={1}
          className={className}
        />
      }
    >
      <VideoGridContent {...props} />
    </Suspense>
  );
}
