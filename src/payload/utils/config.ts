export function buildPagePreviewUrl(pathname: string) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}${pathname}`;
  return url;
}
