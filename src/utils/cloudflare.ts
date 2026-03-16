/**
 * Transform Payload media url to Cloudflare image url
 * @param url
 */
export function transformUrl(
  url: string,
  options: Record<string, string> = {},
) {
  const filename = url.split("/").pop();

  const optionsString = Object.entries({
    ...options,
    // redirects to unresized image when resize fails
    onerror: "redirect",
  })
    .map(([key, value]) => `${key}=${value}`)
    .join(",");

  const transformUrl = `https://cdn.dongdaminhgovap.org/cdn-cgi/image/${optionsString}/${filename}`;
  return transformUrl;
}
