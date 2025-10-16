import { notFound, redirect } from "next/navigation";

export default async function AuthBasicPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { nextUrl } = await props.searchParams;

  if (!nextUrl || typeof nextUrl !== "string") {
    // invalid nextUrl
    return notFound();
  }

  redirect(nextUrl);
}
