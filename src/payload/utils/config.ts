export function buildPagePreviewUrl(pathname: string) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}${pathname}`;
  return url;
}

export function buildPostPreviewUrl(slug: string) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/posts/${slug}`;
  return url;
}
