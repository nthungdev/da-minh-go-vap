import { cn } from "@/utils/common";

interface SpotifyEmbedProps {
  url: string;
  className?: string;
}

/**
 * Converts various Spotify URL formats to standard embed URLs:
 * - https://open.spotify.com/episode/xyz -> https://open.spotify.com/embed/episode/xyz
 * - https://open.spotify.com/show/xyz -> https://open.spotify.com/embed/show/xyz
 * - https://open.spotify.com/track/xyz -> https://open.spotify.com/embed/track/xyz
 * - spotify:episode:xyz -> https://open.spotify.com/embed/episode/xyz
 */
function normalizeSpotifyEmbedUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (trimmed.includes("spotify.com/embed/")) {
    return trimmed;
  }
  if (trimmed.startsWith("spotify:")) {
    const parts = trimmed.split(":");
    if (parts.length >= 3) {
      return `https://open.spotify.com/embed/${parts[1]}/${parts[2]}`;
    }
  }
  const match = trimmed.match(
    /spotify\.com\/(episode|show|track|album|playlist)\/([a-zA-Z0-9]+)/,
  );
  if (match) {
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
  }
  return trimmed;
}

export default function SpotifyEmbed({ url, className }: SpotifyEmbedProps) {
  if (!url) return null;

  const embedUrl = normalizeSpotifyEmbedUrl(url);

  return (
    <div
      className={cn("w-full overflow-hidden rounded-xl shadow-sm", className)}
    >
      <iframe
        src={embedUrl}
        width="100%"
        height="152"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="w-full rounded-xl"
        title="Spotify Podcast Player"
      />
    </div>
  );
}
