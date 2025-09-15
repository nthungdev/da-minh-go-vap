"use server";

import Fuses from "@/utils/fuses";

export const searchPosts = async (query: string) => {
  return (await Fuses.instance.getPostFuse()).search(query);
};
