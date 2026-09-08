/**
 * Constructs the preview URL path for pages in Payload CMS.
 * Returning a relative path allows Payload Admin to resolve preview URLs
 * dynamically against the current window origin across multiple domains.
 *
 * @param pathname - Page route pathname.
 * @returns Relative path for the page preview.
 */
export function buildPagePreviewUrl(pathname: string) {
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

/**
 * Constructs the preview URL path for posts in Payload CMS.
 * Returning a relative path allows Payload Admin to resolve preview URLs
 * dynamically against the current window origin across multiple domains.
 *
 * @param slug - Post URL slug.
 * @returns Relative path for the post preview.
 */
export function buildPostPreviewUrl(slug: string) {
  return `/posts/${slug}`;
}
