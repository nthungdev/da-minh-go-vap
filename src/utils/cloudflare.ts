/**
 * Transform Payload media url to Cloudflare image url.
 * Ref: https://developers.cloudflare.com/images/transform-images/transform-via-url
 */
export function transformUrl(
  url: string,
  options: Record<string, string> = {},
) {
  if (!url) return "";
  const filename = url.split("/").pop();

  const optionsString = Object.entries({
    format: "auto",
    quality: "85",
    onerror: "redirect",
    ...options,
  })
    .map(([key, value]) => `${key}=${value}`)
    .join(",");

  const transformUrl = `https://cdn.dongdaminhgovap.org/cdn-cgi/image/${optionsString}/${filename}`;
  return transformUrl;
}
