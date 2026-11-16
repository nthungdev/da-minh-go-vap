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
  if (path) {
    revalidatePath(path);
  }
  const tagsToInvalidate =
    Array.isArray(tags) && tags.length > 0 ? tags : DEFAULT_CACHE_TAGS;
  for (const tag of tagsToInvalidate) {
    revalidateTag(tag);
  }
  console.log("Revalidated path:", path, "tags:", tagsToInvalidate);
  return Response.json({ revalidated: true });
}
