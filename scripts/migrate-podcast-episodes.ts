/**
 * Populate page podcast blocks from spotifyPodcasts without changing the source collection.
 * Run with `pnpm migrate:podcast-episodes [apply]`; without `apply`, it only reports changes.
 */
import type { Page } from "../payload-types.ts";
import type { SourcePodcastEpisode } from "../src/utils/podcast-episode-migration.ts";
import { createPodcastEpisodePageMigrator } from "../src/utils/podcast-episode-migration.ts";

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
const payload = await getPayload({ config, disableOnInit: true });

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
  let pagesToChange = 0;
  let pagesUpdated = 0;
  let blocksToChange = 0;
  let blocksUpdated = 0;
  let blocksFound = 0;
  const failedPageUpdates: Array<{ id: string; message: string }> = [];
  let pageNumber = 1;

  while (true) {
    const result = await payload.find({
      collection: "pages",
      depth: 0,
      limit: PAGE_SIZE,
      overrideAccess: true,
      page: pageNumber,
      // Page updates do not change this unique field, so offset paging stays stable.
      sort: "id",
    });

    for (const page of result.docs) {
      pagesScanned += 1;
      const migration = migratePage(page);
      blocksFound += migration.blocksFound;

      if (migration.blocksFound > 0) pagesWithPodcastBlocks += 1;
      if (migration.changedSections.length === 0) continue;

      pagesToChange += 1;
      blocksToChange += migration.blocksChanged;
      if (!applyChanges) continue;

      const data: Partial<Pick<Page, "main" | "beforeMain">> = {};
      if (migration.changedSections.includes("main")) {
        data.main = migration.page.main;
      }
      if (migration.changedSections.includes("beforeMain")) {
        data.beforeMain = migration.page.beforeMain;
      }

      try {
        await payload.update({
          collection: "pages",
          data,
          depth: 0,
          id: page.id,
          overrideAccess: true,
        });
        pagesUpdated += 1;
        blocksUpdated += migration.blocksChanged;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failedPageUpdates.push({ id: String(page.id), message });
        console.error(`Failed to update page ${page.id}: ${message}`);
      }
    }

    if (!result.hasNextPage) break;
    pageNumber += 1;
  }

  const updateSummary = applyChanges
    ? `${pagesUpdated} pages and ${blocksUpdated} blocks updated; ${failedPageUpdates.length} page updates failed`
    : `${pagesToChange} pages and ${blocksToChange} blocks to update`;
  console.log(
    `${applyChanges ? "Applied" : "Dry run"}: ${pagesScanned} pages scanned, ${pagesWithPodcastBlocks} pages with podcast blocks, ${blocksFound} blocks found, ${updateSummary}.`,
  );
  if (!applyChanges) console.log("Pass apply to write the page updates.");

  if (failedPageUpdates.length > 0) {
    const failedIds = failedPageUpdates.map(({ id }) => id).join(", ");
    throw new Error(
      `Migration had ${failedPageUpdates.length} failed page updates (${failedIds}). Rerun after resolving the reported errors.`,
    );
  }
} finally {
  await payload.destroy();
}
