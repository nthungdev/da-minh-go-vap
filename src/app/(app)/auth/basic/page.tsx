import { isValidNextUrl } from "@/utils/url";
import { redirect } from "next/navigation";

export default async function AuthBasicPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { nextUrl } = await props.searchParams;

  const targetUrl = isValidNextUrl(nextUrl) ? nextUrl : "/";

  redirect(targetUrl);
}
