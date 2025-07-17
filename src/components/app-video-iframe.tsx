import FacebookIframe from "./app-facebook-iframe";
import YoutubeIframe from "./app-youtube-iframe";

export default function VideoIframe({
  url,
  type,
  className,
}: {
  url: string;
  type: string;
  className?: string;
}) {
  return type === "youtube" ? (
    <YoutubeIframe url={url} className={className} />
  ) : (
    <FacebookIframe url={url} className={className} />
  );
}
