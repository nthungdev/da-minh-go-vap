"use client";

import { fetchSpotifyPodcasts } from "@/actions/spotify-podcast";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import PaginationPanel from "@/components/pagination-panel";
import Spinner from "@/components/spinner";

const PAGE_SIZE = 10;

interface SpotifyPodcastListProps {
  /** Number of podcasts to display per page. Defaults to 10. */
  pageSize?: number;
}

export default function SpotifyPodcastList({
  pageSize,
}: SpotifyPodcastListProps) {
  const [page, setPage] = useState(1);

  const { data, isError, error, isPending, isFetching } = useQuery({
    queryKey: ["spotifyPodcasts", page],
    queryFn: () => fetchSpotifyPodcasts({ page, limit: pageSize || PAGE_SIZE }),
    placeholderData: keepPreviousData,
  });

  const hidePagination = !data || data.totalPages <= 1;

  return (
    <div className="space-y-4">
      {isPending || isFetching ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : isError ? (
        <p className="text-center text-red-500">{error.message}</p>
      ) : (
        <div className="space-y-5">
          {data.podcasts.map((podcast) => (
            <iframe
              key={podcast.id}
              src={`https://open.spotify.com/embed/episode/${podcast.spotifyId}?utm_source=generator`}
              width="100%"
              height="152"
              className="rounded-xl"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          ))}
        </div>
      )}

      {!hidePagination && (
        <PaginationPanel
          className="mt-4"
          totalPages={data!.totalPages}
          page={data!.page}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
