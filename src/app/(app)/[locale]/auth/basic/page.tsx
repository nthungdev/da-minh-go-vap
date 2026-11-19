import { applyRouteLocale, type LocaleParams } from "@/i18n/server";
import { isValidNextUrl } from "@/utils/url";
import { redirect } from "next/navigation";

export default async function AuthBasicPage(props: {
  params: Promise<LocaleParams>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  applyRouteLocale((await props.params).locale);
  const { nextUrl } = await props.searchParams;

  const targetUrl = isValidNextUrl(nextUrl) ? nextUrl : "/";

  redirect(targetUrl);
}
