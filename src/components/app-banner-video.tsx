import { VideoHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export default function AppBannerVideo(
  props: VideoHTMLAttributes<HTMLVideoElement>,
) {
  return (
    <video
      className={twMerge("object-cover h-full w-full", props.className)}
      autoPlay
      loop
      muted
      playsInline
      {...props}
    />
  );
}
