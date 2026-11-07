import { cn } from "@/utils/common";

export default function YoutubeIframe({
  videoId,
  className,
}: {
  videoId: string;
  className?: string;
}) {
  return (
    <iframe
      className={cn("aspect-video w-full", className)}
      src={`https://www.youtube.com/embed/${videoId}`}
      allowFullScreen
    />
  );
}
