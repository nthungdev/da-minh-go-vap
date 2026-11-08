const SPOTIFY_KINDS = "episode|show|track|album|playlist";
const SPOTIFY_URI_PATTERN = new RegExp(
  `^spotify:(${SPOTIFY_KINDS}):([A-Za-z0-9]+)$`,
);
const SPOTIFY_PATH_PATTERN = new RegExp(
  `^/(?:embed/)?(${SPOTIFY_KINDS})/([A-Za-z0-9]+)`,
);

/**
 * Converts a Spotify share URL, embed URL, or `spotify:<kind>:<id>` URI to an
 * `open.spotify.com/embed` URL. Returns null for anything else, so editor input
 * can never point the embed iframe at a non-Spotify origin.
 */
export function toSpotifyEmbedUrl(raw: string): string | null {
  const trimmed = raw.trim();

  const uriMatch = trimmed.match(SPOTIFY_URI_PATTERN);
  if (uriMatch) {
    return `https://open.spotify.com/embed/${uriMatch[1]}/${uriMatch[2]}`;
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.hostname !== "open.spotify.com") {
    return null;
  }

  const pathMatch = url.pathname.match(SPOTIFY_PATH_PATTERN);
  return pathMatch
    ? `https://open.spotify.com/embed/${pathMatch[1]}/${pathMatch[2]}`
    : null;
}
