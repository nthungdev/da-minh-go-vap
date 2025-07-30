import { VideoHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export default function AppBannerVideo(
  props: VideoHTMLAttributes<HTMLVideoElement>,
) {
  return (
    <video
      className={twMerge("h-full w-full object-cover", props.className)}
      autoPlay
      loop
      muted
      playsInline
      {...props}
    />
  );
}
