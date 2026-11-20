import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import AppPage from "@/components/app-page";
import BlocksRenderer from "@/components/blocks-renderer";
import RefreshRouteOnSave from "@/components/refresh-route-on-save";
import {
  applyRouteLocale,
  type LocaleParams,
  requireSiteAuth,
} from "@/i18n/server";
import { getPageByPath } from "@/payload/utils/queries";

type Props = {
  // path must be an array of strings 🤷
  params: Promise<LocaleParams & { path?: string[] }>;
};

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const parentMetadata = await parent;
  const params = await props.params;
  const locale = applyRouteLocale(params.locale);
  const path = `/${(params.path || []).join("/")}`;
  const page = await getPageByPath(path, locale);

  return {
    title: page?.seo?.title,
    description: page?.seo?.description,
    keywords: page?.seo?.keywords,
    openGraph: {
      title: page?.seo?.title ?? undefined,
      description: page?.seo?.description ?? undefined,
      type: "website",
      locale: parentMetadata.openGraph?.locale,
      images: parentMetadata.openGraph?.images,
    },
  };
}

export const revalidate = 60;

// Prerender the homepage for each locale (the layout supplies `locale`); other
// pages render on first request and are then served from the ISR cache, so
// builds don't render ~100 pages per locale against the database.
export function generateStaticParams(): Pick<
  Awaited<Props["params"]>,
  "path"
>[] {
  return [{ path: [] }];
}

export default async function Page(props: Props) {
  const params = await props.params;
  const locale = applyRouteLocale(params.locale);
  const path = `/${(params.path || []).join("/")}`;
  const page = await getPageByPath(path, locale);
  if (!page) {
    console.info("Page not found for path:", path);
    if (path === "/") {
      console.info(
        "No page found for the homepage. Please create a page with path '/' in Payload CMS at /admin.",
      );
    }
    notFound();
  }

  if (page.requireHttpBasicAuth) {
    requireSiteAuth(params.locale, path);
  }

  const banners =
    (page.banners?.every((b) => typeof b === "object") && page.banners) || [];

  return (
    <AppPage
      banners={banners}
      showDecorativeGraphic={page.showBannersDecorativeGraphic ?? false}
    >
      <RefreshRouteOnSave />
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
            <aside className="hidden w-56 bg-primary-1 lg:w-64 xl:block">
              <BlocksRenderer blocks={page.aside} />
            </aside>
          )}
        </div>
      </div>
    </AppPage>
  );
}
