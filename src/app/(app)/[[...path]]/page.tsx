import { getPayload } from "payload";
import config from "@payload-config";
import AppPage from "@/components/app-page";
import BlocksRenderer from "@/components/blocks-renderer";
import { notFound, redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { getPageByPath } from "@/payload/utils/queries";

export async function generateStaticParams() {
  const payload = await getPayload({ config });
  const pages = await payload.find({ collection: "pages" });
  const params = pages.docs.map((page) => ({
    // skip the leading slash
    path: page.path.substring(1).split("/"),
  }));
  return params;
}

export default async function Page(props: {
  // path must be an array of strings 🤷
  params: Promise<{ path?: string[] }>;
}) {
  const requestHeaders = await headers();
  const locale = await getLocale();
  const params = await props.params;
  const path = "/" + (params.path || []).join("/");
  const page = await getPageByPath(path, locale);
  if (!page) {
    console.info("Page not found for path:", path);
    notFound();
  }

  if (page.requireHttpBasicAuth) {
    const href = requestHeaders.get("x-href");

    if (!href) {
      // x-href header is not being set by the middleware
      throw new Error("Something went wrong");
    }

    const c = await cookies();
    const isAuthorized = c.get("x-site-auth")?.value === "true";

    if (!isAuthorized) {
      // redirects to auth basic page to enter credentials
      const searchParams = new URLSearchParams();
      searchParams.append("nextUrl", href);
      redirect(`/auth/basic?${searchParams.toString()}`);
    }
  }

  const banners =
    (page.banners &&
      page.banners.every((b) => typeof b === "object") &&
      page.banners) ||
    [];

  return (
    <AppPage
      banners={banners}
      showDecorativeGraphic={page.showBannersDecorativeGraphic ?? false}
    >
      <h1 className="sr-only">{page.title}</h1>
      <div className="space-y-4 lg:space-y-8">
        {!!page.beforeMain?.length && (
          <section>
            <BlocksRenderer blocks={page.beforeMain} />
          </section>
        )}
        <div className="flex-row items-start gap-x-4 lg:flex">
          {!!page.main?.length && (
            <section className="flex-1">
              <BlocksRenderer blocks={page.main} />
            </section>
          )}
          {!!page?.aside?.length && (
            <aside className="bg-primary-1 hidden w-56 lg:w-64 xl:block">
              <BlocksRenderer blocks={page.aside} />
            </aside>
          )}
        </div>
      </div>
    </AppPage>
  );
}
