import { useTranslations } from "next-intl";
import { cn } from "@/utils/common";
import { toSpotifyEmbedUrl } from "@/utils/spotify";

interface SpotifyEmbedProps {
  url?: string | null;
  className?: string;
}

export default function SpotifyEmbed({ url, className }: SpotifyEmbedProps) {
  const t = useTranslations("postTemplates");
  const embedUrl = url ? toSpotifyEmbedUrl(url) : null;
  if (!embedUrl) return null;

  return (
    <div
      className={cn(
        "h-[152px] w-full overflow-hidden rounded-xl bg-surface-muted",
        className,
      )}
    >
      <iframe
        src={embedUrl}
        width="100%"
        height="152"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-popups"
        className="block h-full w-full rounded-xl border-0"
        title={t("spotifyPlayerTitle")}
      />
    </div>
  );
}
