import { cn } from "@/utils/common";

export interface VideoItem {
  id?: string | null;
  title: string;
  type: "youtube" | "facebook";
  url: string;
}

export interface VideoGridProps {
  title?: string;
  videos?: VideoItem[];
  className?: string;
}

/**
 * Extracts a YouTube video ID from various YouTube URL formats
 * including watch, embed, shorts, youtu.be, or raw video IDs.
 *
 * @param urlOrId - The YouTube URL or raw video ID
 * @returns The parsed YouTube video ID string
 */
export function extractYoutubeId(urlOrId: string): string {
  if (!urlOrId) return "";

  // Check for shorts: https://www.youtube.com/shorts/<id>
  const shortsMatch = urlOrId.match(
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/,
  );
  if (shortsMatch?.[1]) return shortsMatch[1];

  // Check for standard watch: https://www.youtube.com/watch?v=<id>
  const watchMatch = urlOrId.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch?.[1]) return watchMatch[1];

  // Check for youtu.be/<id>
  const shortUrlMatch = urlOrId.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortUrlMatch?.[1]) return shortUrlMatch[1];

  // Check for embed: https://www.youtube.com/embed/<id>
  const embedMatch = urlOrId.match(
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
  );
  if (embedMatch?.[1]) return embedMatch[1];

  // Otherwise assume it is already a video ID
  return urlOrId.trim();
}

/**
 * Determines whether a given video URL corresponds to a YouTube Short.
 *
 * @param url - Video URL string
 * @returns True if the URL contains YouTube shorts path
 */
export function isYoutubeShort(url: string): boolean {
  return typeof url === "string" && url.includes("/shorts/");
}

/**
 * Renders a responsive grid of embedded videos, supporting YouTube Shorts,
 * standard YouTube videos, and Facebook embeds.
 */
export default function VideoGrid({
  title,
  videos = [],
  className,
}: VideoGridProps) {
  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <section className={cn("my-8 w-full", className)}>
      {title && (
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
          {title}
        </h2>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {videos.map((video, index) => {
          const isShort = isYoutubeShort(video.url);
          const youtubeId =
            video.type === "youtube" ? extractYoutubeId(video.url) : null;

          return (
            <div
              key={video.id || `${video.url}-${index}`}
              className={cn(
                "group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md",
              )}
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
                  <h3 className="line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-primary-600">
                    {video.title}
                  </h3>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
