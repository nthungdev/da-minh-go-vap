import { VideoHTMLAttributes } from "react";
import { cn } from "@/utils/common";

export default function AppBannerVideo(
  props: VideoHTMLAttributes<HTMLVideoElement>,
) {
  return (
    <video
      className={cn("h-full w-full object-cover", props.className)}
      autoPlay
      loop
      muted
      playsInline
      {...props}
    />
  );
}
