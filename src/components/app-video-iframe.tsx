import FacebookIframe from "./app-facebook-iframe";
import YoutubeIframe from "./app-youtube-iframe";

export default function VideoIframe({
  videoId,
  type,
  className,
}: {
  videoId: string;
  type: string;
  className?: string;
}) {
  return type === "youtube" ? (
    <YoutubeIframe videoId={videoId} className={className} />
  ) : (
    <FacebookIframe videoId={videoId} className={className} />
  );
}
