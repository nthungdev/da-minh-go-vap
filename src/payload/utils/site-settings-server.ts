import { getPayload } from "payload";
import config from "@payload-config";
import { cache } from "react";
import { unstable_cache } from "next/cache";

const getSiteSettingsCached = unstable_cache(
  async () => {
    const payload = await getPayload({ config });
    return payload.findGlobal({ slug: "siteSettings" });
  },
  ["site-settings-global"],
  { tags: ["globals", "siteSettings"], revalidate: 300 },
);

export const getSiteSettings = cache(async () => {
  return getSiteSettingsCached();
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
