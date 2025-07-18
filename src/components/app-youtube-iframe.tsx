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
      className={twMerge("w-full aspect-video", className)}
      src={`https://www.youtube.com/embed/${videoId}`}
      allowFullScreen
    />
  );
}
