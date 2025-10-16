// import "server-only";

import { getPayload } from "payload";
import config from "@payload-config";
import { Locale } from "next-intl";

export async function getPageByPath(path: string, locale: Locale) {
  const payload = await getPayload({ config });
  const query = await payload.find({
    collection: "pages",
    where: {
      path: { equals: path },
    },
    locale,
  });
  const page = query.docs[0] ?? null;
  return page;
}
