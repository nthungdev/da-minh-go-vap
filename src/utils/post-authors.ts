import type { Author, Post } from "@/payload-types";

export type PostAuthorsValue = Post["authors"] | (string | Author | null)[];

/** Returns ordered `"<honorific> <name>"` display names, skipping unpopulated refs and empty names. */
export function getPostAuthorNames(authors: PostAuthorsValue): string[] {
  if (!Array.isArray(authors)) return [];

  const names: string[] = [];
  for (const author of authors) {
    // Unpopulated ids and deleted references carry no displayable name
    if (!author || typeof author !== "object") continue;

    const name = author.name?.trim();
    if (!name) continue;

    const honorific = author.honorific?.trim();
    names.push(honorific ? `${honorific} ${name}` : name);
  }
  return names;
}

/** Joins author names with the locale's conjunction list format (e.g. "A, B and C"). */
export function formatPostAuthorNames(names: string[], locale: string): string {
  return new Intl.ListFormat(locale, {
    style: "long",
    type: "conjunction",
  }).format(names);
}
