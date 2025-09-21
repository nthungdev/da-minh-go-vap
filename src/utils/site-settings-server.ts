import { getPayload } from "payload";
import config from "@payload-config";

export async function getLogo() {
  const payload = await getPayload({ config });
  const siteSettings = await payload.findGlobal({ slug: "siteSettings" });
  const logo = siteSettings.logo;
  if (typeof logo === "string") {
    return undefined;
  } else {
    return logo || undefined;
  }
}
