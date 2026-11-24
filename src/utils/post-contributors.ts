import type { Contributor } from "@/payload-types";

/** Contributor roles in their admin display order. */
export const contributorRoles = [
  "author",
  "translator",
  "narrator",
  "editor",
  "presenter",
  "producer",
  "photographer",
] as const;

export type ContributorRole = (typeof contributorRoles)[number];

export type PostContributorRow = {
  person?: string | Pick<Contributor, "name" | "honorific"> | null;
  role?: ContributorRole | null;
};

export type ContributorRoleGroup = {
  role: ContributorRole;
  names: string[];
};

/** Groups populated contributors by role (first-appearance order) as `"<honorific> <name>"` names. */
export function groupPostContributors(
  rows: PostContributorRow[] | null | undefined,
): ContributorRoleGroup[] {
  if (!Array.isArray(rows)) return [];

  const groups = new Map<ContributorRole, string[]>();
  for (const row of rows) {
    const person = row?.person;
    // Unpopulated ids and deleted references carry no displayable name
    if (!person || typeof person !== "object" || !row.role) continue;

    const name = person.name?.trim();
    if (!name) continue;

    const honorific = person.honorific?.trim();
    const displayName = honorific ? `${honorific} ${name}` : name;

    const names = groups.get(row.role);
    if (names) names.push(displayName);
    else groups.set(row.role, [displayName]);
  }

  return Array.from(groups, ([role, names]) => ({ role, names }));
}

/** Returns the names credited with `role`, or `[]`. */
export function getContributorNames(
  groups: ContributorRoleGroup[],
  role: ContributorRole,
): string[] {
  return groups.find((group) => group.role === role)?.names ?? [];
}

/** Joins names with the locale's conjunction list format (e.g. "A, B and C"). */
export function formatContributorNames(
  names: string[],
  locale: string,
): string {
  return new Intl.ListFormat(locale, {
    style: "long",
    type: "conjunction",
  }).format(names);
}
