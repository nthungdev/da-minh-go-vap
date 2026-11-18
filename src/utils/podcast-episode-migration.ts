type PodcastEpisode = {
  id?: string | null;
  label: string;
  spotifyId: string;
};

export type SourcePodcastEpisode = Pick<
  PodcastEpisode,
  "label" | "spotifyId"
> & {
  createdAt: string;
};

type PageRecord = {
  main?: unknown;
  beforeMain?: unknown;
};

type PodcastListBlock = Record<string, unknown> & {
  blockType: "spotifyPodcastList";
  episodes?: PodcastEpisode[] | null;
};

type PageSection = "main" | "beforeMain";

export type PodcastPageMigrationResult<PageType> = {
  page: PageType;
  blocksFound: number;
  blocksChanged: number;
  changedSections: PageSection[];
};

/** Sorts source episodes in the order used by the global podcast list. */
function sortEpisodesByCreatedAt(
  episodes: readonly SourcePodcastEpisode[],
): SourcePodcastEpisode[] {
  return [...episodes].sort(
    (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPodcastListBlock(value: unknown): value is PodcastListBlock {
  return isRecord(value) && value.blockType === "spotifyPodcastList";
}

function sameEpisodes(
  left: readonly PodcastEpisode[],
  right: readonly PodcastEpisode[],
): boolean {
  return (
    left.length === right.length &&
    left.every(
      (episode, index) =>
        episode.label === right[index]?.label &&
        episode.spotifyId === right[index]?.spotifyId &&
        episode.id === right[index]?.id,
    )
  );
}

function mergeEpisodes(
  existingEpisodes: readonly PodcastEpisode[] | null | undefined,
  sourceEpisodes: readonly SourcePodcastEpisode[],
): PodcastEpisode[] {
  // Preserve editorial order and duplicates; append only source occurrences not already present.
  const mergedEpisodes = [...(existingEpisodes ?? [])];
  const existingCounts = new Map<string, number>();
  for (const episode of existingEpisodes ?? []) {
    const count = existingCounts.get(episode.spotifyId) ?? 0;
    existingCounts.set(episode.spotifyId, count + 1);
  }

  const sourceCounts = new Map<string, number>();
  for (const episode of sourceEpisodes) {
    const count = (sourceCounts.get(episode.spotifyId) ?? 0) + 1;
    sourceCounts.set(episode.spotifyId, count);

    if (count > (existingCounts.get(episode.spotifyId) ?? 0)) {
      mergedEpisodes.push({
        label: episode.label,
        spotifyId: episode.spotifyId,
      });
    }
  }

  return mergedEpisodes;
}

function migrateSection(
  value: unknown,
  sourceEpisodes: readonly SourcePodcastEpisode[],
) {
  if (!Array.isArray(value)) {
    return { value, blocksFound: 0, blocksChanged: 0, changed: false };
  }

  let blocksFound = 0;
  let blocksChanged = 0;
  const blocks = value.map((block) => {
    if (!isPodcastListBlock(block)) return block;

    blocksFound += 1;
    if (sourceEpisodes.length === 0) return block;

    const existingEpisodes = Array.isArray(block.episodes)
      ? block.episodes
      : [];
    const episodes = mergeEpisodes(block.episodes, sourceEpisodes);
    if (sameEpisodes(existingEpisodes, episodes)) return block;

    blocksChanged += 1;
    return { ...block, episodes };
  });

  const changed = blocksChanged > 0;
  return {
    value: changed ? blocks : value,
    blocksFound,
    blocksChanged,
    changed,
  };
}

/** Copies ordered source episodes into every podcast list block on a page. */
export function createPodcastEpisodePageMigrator(
  sourceEpisodes: readonly SourcePodcastEpisode[],
) {
  const orderedEpisodes = sortEpisodesByCreatedAt(sourceEpisodes);

  return function migratePage<PageType extends PageRecord>(
    page: PageType,
  ): PodcastPageMigrationResult<PageType> {
    const main = migrateSection(page.main, orderedEpisodes);
    const beforeMain = migrateSection(page.beforeMain, orderedEpisodes);
    const changedSections: PageSection[] = [];
    if (main.changed) changedSections.push("main");
    if (beforeMain.changed) changedSections.push("beforeMain");

    if (changedSections.length === 0) {
      return {
        page,
        blocksFound: main.blocksFound + beforeMain.blocksFound,
        blocksChanged: 0,
        changedSections,
      };
    }

    return {
      page: {
        ...page,
        ...(main.changed ? { main: main.value } : {}),
        ...(beforeMain.changed ? { beforeMain: beforeMain.value } : {}),
      } as PageType,
      blocksFound: main.blocksFound + beforeMain.blocksFound,
      blocksChanged: main.blocksChanged + beforeMain.blocksChanged,
      changedSections,
    };
  };
}
