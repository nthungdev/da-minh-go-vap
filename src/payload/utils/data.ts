export function isDataValid<T extends object>(
  data: string | T | null | undefined,
) {
  return !!data && typeof data !== "string";
}

/**
 * If the data is not an object, it's considered not existed.
 * This utility function is used to ensure that we only return valid data objects.
 * @param data
 */
export function getDataOrUndefined<T extends object>(
  data: string | T | null | undefined,
) {
  return isDataValid(data) ? data : null;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** revalidate cache */
export async function revalidatePath(path: string) {
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/revalidate`, {
    method: "POST",
    body: JSON.stringify({ path }),
  });
}
