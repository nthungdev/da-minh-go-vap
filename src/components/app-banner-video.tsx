import clsx from 'clsx'
import { VideoHTMLAttributes } from 'react'

interface AppBannerVideoProps extends VideoHTMLAttributes<HTMLVideoElement> {}

export default function AppBannerVideo(props: AppBannerVideoProps) {
  return (
    <video
      {...props}
      className={clsx('object-cover h-full w-full', props.className)}
      autoPlay
      loop
      muted
      playsInline
    />
  )
}
