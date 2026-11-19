"use client";

import { useState } from "react";
import PaginationPanel from "@/components/pagination-panel";

const PAGE_SIZE = 10;

interface SpotifyPodcastEpisode {
  id?: string | null;
  label: string;
  spotifyId: string;
}

interface SpotifyPodcastListProps {
  episodes?: SpotifyPodcastEpisode[] | null;
  pageSize?: number;
}

export default function SpotifyPodcastList({
  episodes = [],
  pageSize,
}: SpotifyPodcastListProps) {
  const [page, setPage] = useState(1);
  const safePageSize = Math.max(1, pageSize || PAGE_SIZE);
  const totalPages = Math.ceil((episodes?.length || 0) / safePageSize);
  const currentPage = Math.min(page, Math.max(totalPages, 1));
  const visibleEpisodes = (episodes || []).slice(
    (currentPage - 1) * safePageSize,
    currentPage * safePageSize,
  );

  return (
    <div className="space-y-4">
      <div className="space-y-5">
        {visibleEpisodes.map((episode, index) => (
          <iframe
            key={episode.id || `${episode.spotifyId}-${index}`}
            title={episode.label}
            src={`https://open.spotify.com/embed/episode/${episode.spotifyId}?utm_source=generator`}
            width="100%"
            height="152"
            className="rounded-xl"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        ))}
      </div>

      {totalPages > 1 && (
        <PaginationPanel
          className="mt-4"
          totalPages={totalPages}
          page={currentPage}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
