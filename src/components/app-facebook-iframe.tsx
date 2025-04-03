import clsx from 'clsx'

export default function FacebookIframe({
  url,
  className,
}: {
  url: string
  className?: string
}) {
  return (
    <iframe
      className={clsx('w-full aspect-video border-none overflow-hidden', className)}
      src={`https://www.facebook.com/plugins/video.php?href=${decodeURIComponent(url)}&width=500&show_text=false&height=281&appId`}
      allowFullScreen
      allow='autoplay; clipboard-write; encrypted-media; web-share'
    />

    // <iframe src="https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Ffb.watch%2FuS_34dMnor%2F&width=500&show_text=false&height=500&appId" width="500" height="500" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowFullScreen="true"></iframe>
  )
}
