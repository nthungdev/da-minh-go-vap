import { localizePathForAllLocales } from "@/i18n/routing";
import { revalidatePath, revalidateTag } from "next/cache";

const DEFAULT_CACHE_TAGS = [
  "pages",
  "posts",
  "globals",
  "navBar",
  "footer",
  "siteSettings",
  "hiddenTags",
];

export async function POST(req: Request) {
  const { path, tags } = (await req.json()) as {
    path?: string;
    tags?: string[];
  };
  // Public pages are cached per locale under the internal `/{locale}` routes.
  const pathsToInvalidate = path ? localizePathForAllLocales(path) : [];
  for (const localizedPath of pathsToInvalidate) {
    revalidatePath(localizedPath);
  }
  const tagsToInvalidate =
    Array.isArray(tags) && tags.length > 0 ? tags : DEFAULT_CACHE_TAGS;
  for (const tag of tagsToInvalidate) {
    revalidateTag(tag);
  }
  console.log(
    "Revalidated paths:",
    pathsToInvalidate,
    "tags:",
    tagsToInvalidate,
  );
  return Response.json({ revalidated: true });
}
