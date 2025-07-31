import { getPayload } from "payload";
import config from "@payload-config";
import AppPage from "@/components/app-page";
import BlocksRenderer from "@/components/blocks-renderer";
import { notFound } from "next/navigation";

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
  const params = await props.params;
  const path = "/" + (params.path || []).join("/");
  const payload = await getPayload({ config });
  const query = await payload.find({
    collection: "pages",
    where: {
      path: { equals: path },
    },
  });
  const page = query.docs[0];
  if (!page) {
    console.log("Page not found for path:", path);
    notFound();
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
