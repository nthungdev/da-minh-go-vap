import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";

export const getSiteSettings = cache(async () => {
  const payload = await getPayload({ config });
  const siteSettings = await payload.findGlobal({ slug: "siteSettings" });
  return siteSettings;
});

export const getLogo = cache(async () => {
  const siteSettings = await getSiteSettings();
  const logo = siteSettings.logo;
  if (typeof logo === "string") {
    return undefined;
  } else {
    return logo || undefined;
  }
});
