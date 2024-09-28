import classNames from 'classnames'

export default function YoutubeIframe({
  url,
  className,
}: {
  url: string
  className?: string
}) {
  return (
    <iframe
      className={classNames('w-full aspect-video', className)}
      src={url}
      allowFullScreen
    />
  )
}
