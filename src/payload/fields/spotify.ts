import { toSpotifyEmbedUrl } from "@/utils/spotify";
import type { TextField } from "payload";

type TextFieldSingle = Extract<TextField, { hasMany?: false }>;

export type SpotifyUrlFieldOptions = Partial<Omit<TextFieldSingle, "type">>;

/**
 * Reusable Spotify podcast URL or Episode Embed ID field.
 */
export function spotifyUrlField(
  overrides?: SpotifyUrlFieldOptions,
): TextFieldSingle {
  const required = overrides?.required ?? true;

  return {
    name: "spotifyUrl",
    type: "text",
    label: "Spotify Podcast URL / Embed ID",
    required,
    validate: (value: string | null | undefined) => {
      if (!value?.trim()) {
        return required ? "Vui lòng nhập link Spotify" : true;
      }
      return toSpotifyEmbedUrl(value)
        ? true
        : "Link Spotify không hợp lệ (ví dụ: https://open.spotify.com/episode/...)";
    },
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
