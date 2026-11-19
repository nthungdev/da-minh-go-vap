import assert from "node:assert/strict";
import test from "node:test";
import { createPodcastEpisodePageMigrator } from "../src/utils/podcast-episode-migration.ts";

const sourceEpisodes = [
  {
    createdAt: "2025-03-01T00:00:00.000Z",
    label: "Newest",
    spotifyId: "newest",
  },
  {
    createdAt: "2025-01-01T00:00:00.000Z",
    label: "Oldest",
    spotifyId: "oldest",
  },
  {
    createdAt: "2025-02-01T00:00:00.000Z",
    label: "Middle",
    spotifyId: "middle",
  },
];

test("migrates main and beforeMain blocks independently in createdAt order", () => {
  const migratePage = createPodcastEpisodePageMigrator(sourceEpisodes);
  const page = {
    id: "page-a",
    main: [
      { blockType: "spotifyPodcastList", episodes: [], pageSize: 4 },
      { blockType: "textBlock", content: "Keep this block" },
      { blockType: "spotifyPodcastList", episodes: [], pageSize: 7 },
    ],
    beforeMain: [
      { blockType: "spotifyPodcastList", episodes: [], pageSize: 2 },
    ],
  };

  const migrated = migratePage(page);
  const mainBlocks = migrated.page.main as typeof page.main;
  const beforeMainBlocks = migrated.page.beforeMain as typeof page.beforeMain;
  const expectedEpisodes = [
    { label: "Newest", spotifyId: "newest" },
    { label: "Middle", spotifyId: "middle" },
    { label: "Oldest", spotifyId: "oldest" },
  ];

  assert.deepEqual(
    [
      ...mainBlocks.filter((block) => block.blockType === "spotifyPodcastList"),
      ...beforeMainBlocks,
    ].map((block) => (block as { episodes: unknown[] }).episodes),
    [expectedEpisodes, expectedEpisodes, expectedEpisodes],
  );
  assert.deepEqual(
    mainBlocks
      .filter((block) => block.blockType === "spotifyPodcastList")
      .map((block) => (block as { pageSize: number }).pageSize),
    [4, 7],
  );
  assert.equal((beforeMainBlocks[0] as { pageSize: number }).pageSize, 2);
  assert.notStrictEqual(
    (mainBlocks[0] as { episodes: unknown[] }).episodes,
    (mainBlocks[2] as { episodes: unknown[] }).episodes,
  );
  assert.notStrictEqual(
    (mainBlocks[0] as { episodes: unknown[] }).episodes[0],
    (mainBlocks[2] as { episodes: unknown[] }).episodes[0],
  );
  assert.equal(migrated.blocksFound, 3);
  assert.equal(migrated.blocksChanged, 3);
  assert.deepEqual(migrated.changedSections, ["main", "beforeMain"]);
});

test("migrates multiple pages independently and is safe to rerun", () => {
  const migratePage = createPodcastEpisodePageMigrator(sourceEpisodes);
  const pages = [
    {
      id: "page-b",
      main: [{ blockType: "spotifyPodcastList", pageSize: 10 }],
    },
    {
      id: "page-d",
      beforeMain: [{ blockType: "spotifyPodcastList", pageSize: 3 }],
    },
  ];

  const firstRun = pages.map((page) => migratePage(page));
  const secondRun = firstRun.map(({ page }) => migratePage(page));
  const firstPageEpisodes = (
    firstRun[0]?.page.main as unknown as Array<{ episodes?: unknown[] }>
  )[0]?.episodes;
  const secondPageEpisodes = (
    firstRun[1]?.page.beforeMain as unknown as Array<{ episodes?: unknown[] }>
  )[0]?.episodes;

  assert.deepEqual(
    firstRun.map((result) => result.blocksChanged),
    [1, 1],
  );
  assert.deepEqual(
    secondRun.map((result) => result.blocksChanged),
    [0, 0],
  );
  assert.strictEqual(secondRun[0]?.page, firstRun[0]?.page);
  assert.strictEqual(secondRun[1]?.page, firstRun[1]?.page);
  assert.equal(firstPageEpisodes?.length, sourceEpisodes.length);
  assert.equal(secondPageEpisodes?.length, sourceEpisodes.length);
  assert.notStrictEqual(firstPageEpisodes, secondPageEpisodes);
});

test("preserves existing block episodes while adding missing source episodes once", () => {
  const migratePage = createPodcastEpisodePageMigrator(sourceEpisodes);
  const page = {
    id: "page-c",
    main: [
      {
        blockType: "spotifyPodcastList",
        episodes: [
          { id: "existing-id", label: "Edited title", spotifyId: "middle" },
          { label: "Custom", spotifyId: "custom" },
          { id: "duplicate-id", label: "Duplicate", spotifyId: "middle" },
        ],
        pageSize: 5,
      },
    ],
  };

  const migrated = migratePage(page);
  const block = (
    migrated.page.main as Array<{
      episodes: Array<{ id?: string; label: string; spotifyId: string }>;
    }>
  )[0];
  assert.ok(block);

  assert.deepEqual(
    block.episodes.map(({ label, spotifyId }) => ({ label, spotifyId })),
    [
      { label: "Edited title", spotifyId: "middle" },
      { label: "Custom", spotifyId: "custom" },
      { label: "Duplicate", spotifyId: "middle" },
      { label: "Newest", spotifyId: "newest" },
      { label: "Oldest", spotifyId: "oldest" },
    ],
  );
  assert.equal(block.episodes[0]?.id, "existing-id");
  assert.equal(block.episodes[2]?.id, "duplicate-id");
  assert.equal(migrated.blocksChanged, 1);

  const rerun = createPodcastEpisodePageMigrator(sourceEpisodes)(migrated.page);
  assert.equal(rerun.blocksChanged, 0);
  assert.strictEqual(rerun.page, migrated.page);
});

test("copies only missing occurrences when source episodes share an ID", () => {
  const migratePage = createPodcastEpisodePageMigrator([
    {
      createdAt: "2025-02-01T00:00:00.000Z",
      label: "Newest duplicate",
      spotifyId: "repeated",
    },
    {
      createdAt: "2025-01-01T00:00:00.000Z",
      label: "Older duplicate",
      spotifyId: "repeated",
    },
  ]);
  const page = {
    main: [
      {
        blockType: "spotifyPodcastList",
        episodes: [
          { id: "curated-id", label: "Curated title", spotifyId: "repeated" },
        ],
      },
    ],
  };

  const migrated = migratePage(page);
  const block = migrated.page.main?.[0] as {
    episodes: Array<{ id?: string; label: string; spotifyId: string }>;
  };

  assert.deepEqual(block.episodes, [
    { id: "curated-id", label: "Curated title", spotifyId: "repeated" },
    { label: "Older duplicate", spotifyId: "repeated" },
  ]);
  assert.equal(migrated.blocksChanged, 1);

  const rerun = migratePage(migrated.page);
  assert.equal(rerun.blocksChanged, 0);
  assert.strictEqual(rerun.page, migrated.page);
});

test("leaves pages without podcast list blocks unchanged", () => {
  const migratePage = createPodcastEpisodePageMigrator(sourceEpisodes);
  const page = {
    id: "page-without-podcast-blocks",
    main: [{ blockType: "textBlock", content: "Untouched" }],
    beforeMain: null,
  };

  const migrated = migratePage(page);

  assert.strictEqual(migrated.page, page);
  assert.equal(migrated.blocksFound, 0);
  assert.equal(migrated.blocksChanged, 0);
  assert.deepEqual(migrated.changedSections, []);
});
