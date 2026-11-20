import { cn } from "@/utils/common";

const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

function parseHttpUrl(input: string): URL | null {
  try {
    const url = new URL(input.includes("://") ? input : `https://${input}`);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

export interface VideoItem {
  id?: string | null;
  title: string;
  type: "youtube" | "facebook";
  url: string;
  isShort?: boolean | null;
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
 * @returns The parsed YouTube video ID or an empty string for invalid input
 */
export function extractYoutubeId(urlOrId: string): string {
  if (!urlOrId) return "";

  const trimmedInput = urlOrId.trim();
  if (YOUTUBE_ID_PATTERN.test(trimmedInput)) return trimmedInput;

  const url = parseHttpUrl(trimmedInput);
  if (!url) return "";

  const hostname = url.hostname.toLowerCase();
  const isShortDomain = hostname === "youtu.be";
  const isYoutubeDomain =
    hostname === "youtube.com" || hostname.endsWith(".youtube.com");
  let candidate = "";

  if (isShortDomain) {
    candidate = url.pathname.split("/").filter(Boolean)[0] ?? "";
  } else if (isYoutubeDomain && url.pathname === "/watch") {
    candidate = url.searchParams.get("v") ?? "";
  } else if (isYoutubeDomain) {
    const pathMatch = url.pathname.match(/^\/(?:shorts|embed)\/([^/]+)\/?$/);
    candidate = pathMatch?.[1] ?? "";
  }

  return YOUTUBE_ID_PATTERN.test(candidate) ? candidate : "";
}

/**
 * Determines whether a given video URL corresponds to a YouTube Short.
 *
 * @param url - Video URL string
 * @param explicitlyShort - Whether the CMS marks a bare ID as a Short
 * @returns True if the URL or CMS field identifies a Short
 */
export function isYoutubeShort(url: string, explicitlyShort = false): boolean {
  if (explicitlyShort) return true;

  const parsedUrl = parseHttpUrl(url);
  if (!parsedUrl) return false;

  const hostname = parsedUrl.hostname.toLowerCase();
  const isYoutubeDomain =
    hostname === "youtube.com" || hostname.endsWith(".youtube.com");

  return isYoutubeDomain && /^\/shorts\/[^/]+\/?$/.test(parsedUrl.pathname);
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
