import { getPayload } from "payload";
import config from "@payload-config";
import AppPage from "@/components/app-page";
import BlocksRenderer from "@/components/blocks-renderer";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getPageByPath } from "@/payload/utils/queries";
import RefreshRouteOnSave from "@/components/refresh-route-on-save";
import { Metadata, ResolvingMetadata } from "next";
import { basicAuthGuard } from "@/utils/auth";

type Props = {
  // path must be an array of strings 🤷
  params: Promise<{ path?: string[] }>;
};

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const parentMetadata = await parent;
  const locale = await getLocale();
  const params = await props.params;
  const path = "/" + (params.path || []).join("/");
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

export async function generateStaticParams() {
  const payload = await getPayload({ config });
  const pages = await payload.find({ collection: "pages" });
  const params = pages.docs.map((page) => ({
    // skip the leading slash
    path: page.path.substring(1).split("/"),
  }));
  return params;
}

export default async function Page(props: Props) {
  const locale = await getLocale();
  const params = await props.params;
  const path = "/" + (params.path || []).join("/");
  const page = await getPageByPath(path, locale);
  if (!page) {
    console.info("Page not found for path:", path);
    notFound();
  }

  if (page.requireHttpBasicAuth) {
    await basicAuthGuard();
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
            <aside className="bg-primary-1 hidden w-56 lg:w-64 xl:block">
              <BlocksRenderer blocks={page.aside} />
            </aside>
          )}
        </div>
      </div>
    </AppPage>
  );
}
