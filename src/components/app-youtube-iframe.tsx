import { twMerge } from "tailwind-merge";

export default function YoutubeIframe({
  videoId,
  className,
}: {
  videoId: string;
  className?: string;
}) {
  return (
    <iframe
      className={twMerge("aspect-video w-full", className)}
      src={`https://www.youtube.com/embed/${videoId}`}
      allowFullScreen
    />
  );
}
