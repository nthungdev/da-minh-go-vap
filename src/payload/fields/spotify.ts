import type { TextField } from "payload";

type TextFieldSingle = Extract<TextField, { hasMany?: false }>;

export type SpotifyUrlFieldOptions = Partial<Omit<TextFieldSingle, "type">>;

/**
 * Reusable Spotify podcast URL or Episode Embed ID field.
 */
export function spotifyUrlField(
  overrides?: SpotifyUrlFieldOptions,
): TextFieldSingle {
  return {
    name: "spotifyUrl",
    type: "text",
    label: "Spotify Podcast URL / Embed ID",
    required: true,
    ...(overrides as object),
    admin: {
      placeholder:
        "https://open.spotify.com/episode/... hoặc spotify:episode:...",
      description: "Link bài podcast audio chia sẻ suy niệm trên Spotify.",
      ...overrides?.admin,
    },
  };
}

export default spotifyUrlField;
