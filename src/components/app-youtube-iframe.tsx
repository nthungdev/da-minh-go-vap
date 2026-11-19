import { cn } from "@/utils/common";

export default function YoutubeIframe({
  videoId,
  className,
  title = "YouTube video player",
}: {
  videoId: string;
  className?: string;
  title?: string;
}) {
  return (
    <iframe
      title={title}
      className={cn("aspect-video w-full", className)}
      src={`https://www.youtube.com/embed/${videoId}`}
      allowFullScreen
    />
  );
}
