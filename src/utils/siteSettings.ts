import getConfig from "next/config";
import { getPayload } from "payload";

export async function getLogo() {
  const payload = await getPayload({ config: getConfig() });
  const siteSettings = await payload.findGlobal({ slug: "siteSettings" });
  const logo = siteSettings.logo;
  if (typeof logo === "string") {
    return undefined;
  } else {
    return logo || undefined;
  }
}
