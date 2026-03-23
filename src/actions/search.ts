"use server";

import { defaultLocale, Locale } from "@/i18n/config";
import Fuses from "@/utils/fuses";

export const searchPosts = async (
  query: string,
  { locale }: { locale?: Locale },
) => {
  const fuse = await Fuses.instance.getPostFuseByLocale(
    locale ?? defaultLocale,
  );
  return fuse.search(query);
};
