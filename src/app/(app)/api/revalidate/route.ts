import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  const secret = process.env.REVALIDATION_SECRET;
  const headerSecret = req.headers.get("x-revalidation-secret");

  if (!secret || !headerSecret || headerSecret !== secret) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  let path: unknown;
  try {
    const body = await req.json();
    path = body?.path;
  } catch {
    return Response.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  if (!path || typeof path !== "string" || !path.startsWith("/")) {
    return Response.json(
      { message: "Path must be a non-empty string starting with '/'" },
      { status: 400 },
    );
  }

  revalidatePath(path);
  console.log("Revalidated path:", path);
  return Response.json({ revalidated: true });
}
