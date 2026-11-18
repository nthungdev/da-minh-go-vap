import { applyRouteLocale, type LocaleParams } from "@/i18n/server";
import { notFound, redirect } from "next/navigation";

export default async function AuthBasicPage(props: {
  params: Promise<LocaleParams>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  applyRouteLocale((await props.params).locale);
  const { nextUrl } = await props.searchParams;

  if (!nextUrl || typeof nextUrl !== "string") {
    // invalid nextUrl
    return notFound();
  }

  redirect(nextUrl);
}
