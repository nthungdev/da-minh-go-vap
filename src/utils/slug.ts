import { slugify } from "@/payload/utils/data";
import { normalizeVietnamese } from "@/utils/search";

export function validateSlug(slug: string | null | undefined) {
  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return "Invalid slug";
  }
  return true;
}

/** Slugifies text after stripping Vietnamese diacritics (e.g. "Đa Minh" → "da-minh"). */
export function slugifyVietnamese(text: string): string {
  return slugify(normalizeVietnamese(text));
}
