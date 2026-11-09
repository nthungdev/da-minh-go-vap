// import "server-only";

import { getPayload } from "payload";
import config from "@payload-config";
import { Locale } from "next-intl";
import { cache } from "react";

export const getPageByPath = cache(async (path: string, locale: Locale) => {
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
});
