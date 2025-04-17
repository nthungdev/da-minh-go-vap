import { twMerge } from 'tailwind-merge'

export default function YoutubeIframe({
  url,
  className,
}: {
  url: string
  className?: string
}) {
  return (
    <iframe
      className={twMerge('w-full aspect-video', className)}
      src={url}
      allowFullScreen
    />
  )
}
