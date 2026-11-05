import { cn } from "@/utils/common";
import { toSpotifyEmbedUrl } from "@/utils/spotify";

interface SpotifyEmbedProps {
  url: string;
  className?: string;
}

export default function SpotifyEmbed({ url, className }: SpotifyEmbedProps) {
  const embedUrl = url ? toSpotifyEmbedUrl(url) : null;
  if (!embedUrl) return null;

  return (
    <div className={cn("w-full overflow-hidden rounded-xl", className)}>
      <iframe
        src={embedUrl}
        width="100%"
        height="152"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-popups"
        className="block w-full rounded-xl"
        title="Spotify Podcast Player"
      />
    </div>
  );
}
