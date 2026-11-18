/**
 * Returns the URL if it is an absolute http(s) link, otherwise null.
 * Keeps editor-entered links from using `javascript:` or other schemes.
 */
export function toSafeHttpUrl(raw: string | null | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

/** Payload `validate` for optional http(s) link fields. */
export function validateOptionalHttpUrl(
  value: string | null | undefined,
): true | string {
  if (!value?.trim()) return true;
  return toSafeHttpUrl(value)
    ? true
    : "Đường dẫn phải bắt đầu bằng http:// hoặc https://";
}
