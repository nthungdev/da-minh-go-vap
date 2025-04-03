import clsx from 'clsx'

export default function YoutubeIframe({
  url,
  className,
}: {
  url: string
  className?: string
}) {
  return (
    <iframe
      className={clsx('w-full aspect-video', className)}
      src={url}
      allowFullScreen
    />
  )
}
