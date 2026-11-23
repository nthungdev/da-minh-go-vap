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
  person?:
    | string
    | (Pick<Contributor, "name" | "honorific"> &
        Partial<Pick<Contributor, "id">>)
    | null;
  role?: ContributorRole | null;
};

export type ContributorCredit = {
  /** Contributor id; missing only when the row was populated without it. */
  id?: string;
  /** `"<honorific> <name>"` */
  name: string;
};

export type ContributorRoleGroup = {
  role: ContributorRole;
  people: ContributorCredit[];
};

/** Formats a contributor as `"<honorific> <name>"`, or `""` when it has no name. */
export function getContributorDisplayName(
  person: Pick<Contributor, "name" | "honorific">,
): string {
  const name = person.name?.trim();
  if (!name) return "";
  const honorific = person.honorific?.trim();
  return honorific ? `${honorific} ${name}` : name;
}

/** Groups populated contributors by role (first-appearance order). */
export function groupPostContributors(
  rows: PostContributorRow[] | null | undefined,
): ContributorRoleGroup[] {
  if (!Array.isArray(rows)) return [];

  const groups = new Map<ContributorRole, ContributorCredit[]>();
  for (const row of rows) {
    const person = row?.person;
    // Unpopulated ids and deleted references carry no displayable name
    if (!person || typeof person !== "object" || !row.role) continue;

    const name = getContributorDisplayName(person);
    if (!name) continue;

    const credit: ContributorCredit = person.id
      ? { id: person.id, name }
      : { name };
    const people = groups.get(row.role);
    if (people) people.push(credit);
    else groups.set(row.role, [credit]);
  }

  return Array.from(groups, ([role, people]) => ({ role, people }));
}

/** Returns the people credited with `role`, or `[]`. */
export function getContributorCredits(
  groups: ContributorRoleGroup[],
  role: ContributorRole,
): ContributorCredit[] {
  return groups.find((group) => group.role === role)?.people ?? [];
}

/** Returns the names credited with `role`, or `[]`. */
export function getContributorNames(
  groups: ContributorRoleGroup[],
  role: ContributorRole,
): string[] {
  return getContributorCredits(groups, role).map((person) => person.name);
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

export type ContributorListPart =
  | { type: "person"; person: ContributorCredit }
  | { type: "literal"; value: string };

/** Splits people into locale list parts (names and separators) so each name can render as a link. */
export function formatContributorListParts(
  people: ContributorCredit[],
  locale: string,
): ContributorListPart[] {
  const parts = new Intl.ListFormat(locale, {
    style: "long",
    type: "conjunction",
  }).formatToParts(people.map((person) => person.name));

  const result: ContributorListPart[] = [];
  let personIndex = 0;
  for (const part of parts) {
    const person = part.type === "element" ? people[personIndex] : undefined;
    if (person) {
      result.push({ type: "person", person });
      personIndex += 1;
    } else {
      result.push({ type: "literal", value: part.value });
    }
  }
  return result;
}
