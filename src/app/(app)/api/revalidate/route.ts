import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(req: Request) {
  const { path } = await req.json();
  revalidatePath(path);
  revalidateTag("pages");
  revalidateTag("posts");
  revalidateTag("globals");
  console.log("Revalidated path:", path);
  return Response.json({ revalidated: true });
}
