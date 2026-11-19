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
  const secret = process.env.REVALIDATION_SECRET;
  const headerSecret = req.headers.get("x-revalidation-secret");

  if (!secret || !headerSecret || headerSecret !== secret) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  let path: unknown;
  let tags: unknown;
  try {
    const body = await req.json();
    path = body?.path;
    tags = body?.tags;
  } catch {
    return Response.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  if (
    path !== undefined &&
    (typeof path !== "string" || !path.startsWith("/"))
  ) {
    return Response.json(
      { message: "Path must be a non-empty string starting with '/'" },
      { status: 400 },
    );
  }

  if (
    tags !== undefined &&
    (!Array.isArray(tags) || tags.some((tag) => typeof tag !== "string"))
  ) {
    return Response.json(
      { message: "Tags must be an array of strings" },
      { status: 400 },
    );
  }

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
