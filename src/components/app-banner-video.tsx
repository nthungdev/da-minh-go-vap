import classNames from 'classnames'
import { VideoHTMLAttributes } from 'react'

interface AppBannerVideoProps extends VideoHTMLAttributes<HTMLVideoElement> {}

export default function AppBannerVideo(props: AppBannerVideoProps) {
  return (
    <video
      {...props}
      className={classNames('object-cover h-full w-full', props.className)}
      autoPlay
      loop
      muted
      playsInline
    />
  )
}
