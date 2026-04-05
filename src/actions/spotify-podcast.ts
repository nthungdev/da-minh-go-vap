"use server";

import config from "@payload-config";
import { getPayload } from "payload";

export async function fetchSpotifyPodcasts({
  page = 1,
  limit = 10,
}: { page?: number; limit?: number } = {}) {
  const payload = await getPayload({ config });
  const query = await payload.find({
    collection: "spotifyPodcasts",
    page,
    limit,
    sort: "-createdAt",
  });
  return {
    podcasts: query.docs,
    page: query.page!,
    totalPages: query.totalPages,
    hasMore: query.hasNextPage,
  };
}
