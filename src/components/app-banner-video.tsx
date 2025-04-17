import { VideoHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

interface AppBannerVideoProps extends VideoHTMLAttributes<HTMLVideoElement> {}

export default function AppBannerVideo(props: AppBannerVideoProps) {
  return (
    <video
      {...props}
      className={twMerge('object-cover h-full w-full', props.className)}
      autoPlay
      loop
      muted
      playsInline
    />
  )
}
