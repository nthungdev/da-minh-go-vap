/**
 * Populate page podcast blocks from spotifyPodcasts without changing the source collection.
 * Run with `pnpm migrate:podcast-episodes [apply]`; without `apply`, it only reports changes.
 */
import type { Page } from "../payload-types.ts";
import { createPodcastEpisodePageMigrator } from "../src/utils/podcast-episode-migration.ts";
import type { SourcePodcastEpisode } from "../src/utils/podcast-episode-migration.ts";

const PAGE_SIZE = 500;
const args = process.argv.slice(2);

if (args.includes("help") || args.includes("--help")) {
  console.log("Usage: pnpm migrate:podcast-episodes [apply]");
  console.log("Default mode is dry-run; pass apply to update pages.");
  process.exit(0);
}

if (args.some((arg) => arg !== "apply")) {
  throw new Error(
    `Unsupported argument: ${args.find((arg) => arg !== "apply")}`,
  );
}

const applyChanges = args.includes("apply");
const [{ default: config }, { getPayload }] = await Promise.all([
  import("../payload.config.ts"),
  import("payload"),
]);
const payload = await getPayload({ config });

async function fetchSourceEpisodes(): Promise<SourcePodcastEpisode[]> {
  const episodes: SourcePodcastEpisode[] = [];
  let pageNumber = 1;

  while (true) {
    const result = await payload.find({
      collection: "spotifyPodcasts",
      depth: 0,
      limit: PAGE_SIZE,
      overrideAccess: true,
      page: pageNumber,
      sort: "-createdAt",
    });

    episodes.push(
      ...result.docs.map(({ createdAt, label, spotifyId }) => ({
        createdAt,
        label,
        spotifyId,
      })),
    );

    if (!result.hasNextPage) break;
    pageNumber += 1;
  }

  return episodes;
}

try {
  const sourceEpisodes = await fetchSourceEpisodes();
  const migratePage = createPodcastEpisodePageMigrator(sourceEpisodes);
  let pagesScanned = 0;
  let pagesWithPodcastBlocks = 0;
  let pagesChanged = 0;
  let blocksFound = 0;
  let blocksChanged = 0;
  let pageNumber = 1;

  while (true) {
    const result = await payload.find({
      collection: "pages",
      depth: 0,
      limit: PAGE_SIZE,
      overrideAccess: true,
      page: pageNumber,
    });

    for (const page of result.docs) {
      pagesScanned += 1;
      const migration = migratePage(page);
      blocksFound += migration.blocksFound;
      blocksChanged += migration.blocksChanged;

      if (migration.blocksFound > 0) pagesWithPodcastBlocks += 1;
      if (migration.changedSections.length === 0) continue;

      pagesChanged += 1;
      if (!applyChanges) continue;

      const data: Partial<Pick<Page, "main" | "beforeMain">> = {};
      if (migration.changedSections.includes("main")) {
        data.main = migration.page.main;
      }
      if (migration.changedSections.includes("beforeMain")) {
        data.beforeMain = migration.page.beforeMain;
      }

      await payload.update({
        collection: "pages",
        data,
        depth: 0,
        id: page.id,
        overrideAccess: true,
      });
    }

    if (!result.hasNextPage) break;
    pageNumber += 1;
  }

  console.log(
    `${applyChanges ? "Applied" : "Dry run"}: ${pagesScanned} pages scanned, ${pagesWithPodcastBlocks} pages with podcast blocks, ${pagesChanged} pages ${applyChanges ? "updated" : "to update"}, ${blocksFound} blocks found, ${blocksChanged} blocks ${applyChanges ? "updated" : "to update"}.`,
  );
  if (!applyChanges) console.log("Pass apply to write the page updates.");
} finally {
  await payload.destroy();
}
