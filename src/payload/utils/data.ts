/**
 * If the data is not an object, it's considered not existed.
 * This utility function is used to ensure that we only return valid data objects.
 * @param data
 */
export function getDataOrUndefined<T>(data: string | T | null | undefined) {
  return !data || typeof data === "string" ? undefined : data;
}
