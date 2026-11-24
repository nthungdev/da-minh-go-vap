import assert from "node:assert/strict";
import * as nodeModule from "node:module";
import test from "node:test";

type ResolveHook = (
  specifier: string,
  context: object,
  nextResolve: (specifier: string, context: object) => unknown,
) => unknown;

const { registerHooks } = nodeModule as unknown as {
  registerHooks: (hooks: { resolve: ResolveHook }) => {
    deregister: () => void;
  };
};

// Node's test runner does not read the TypeScript path alias.
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    const target =
      specifier === "@/utils/safe-url"
        ? new URL("./safe-url.ts", import.meta.url).href
        : specifier;
    return nextResolve(target, context);
  },
});

const { normalizeFactLabel, resolveBiographyHeading, resolveTributeSources } =
  await import("./tribute-profile.ts");
hooks.deregister();

test("normalizeFactLabel trims surrounding whitespace", () => {
  assert.equal(normalizeFactLabel(" \tNgày sinh \n"), "Ngày sinh");
  assert.equal(normalizeFactLabel(" \t\n"), "");
});

test("normalizeFactLabel strips trailing ASCII and fullwidth colons", () => {
  assert.equal(normalizeFactLabel("Ngày sinh: "), "Ngày sinh");
  assert.equal(normalizeFactLabel("Ngày sinh：\t"), "Ngày sinh");
  assert.equal(normalizeFactLabel("  Ngày sinh : ：:\n"), "Ngày sinh");
  assert.equal(normalizeFactLabel(" ：: "), "");
});

test("normalizeFactLabel preserves internal colons and text", () => {
  assert.equal(
    normalizeFactLabel("  Giờ: 08:30 — Kỷ niệm：tròn 10 năm：  "),
    "Giờ: 08:30 — Kỷ niệm：tròn 10 năm",
  );
});

test("resolveTributeSources returns an empty list for missing or empty input", () => {
  assert.deepEqual(resolveTributeSources(undefined), []);
  assert.deepEqual(resolveTributeSources(null), []);
  assert.deepEqual(resolveTributeSources([]), []);
});

test("resolveTributeSources skips blank labels and keeps trimmed labels, IDs, and row order", () => {
  assert.deepEqual(
    resolveTributeSources([
      { id: "archive", label: "  Hồ sơ \t" },
      { id: "blank", label: "", url: "https://example.org/unused" },
      { label: "\t\n" },
      { label: "Hồ sơ" },
      { id: null, label: "Tưởng niệm", url: null },
      { id: "family", label: "Gia đình" },
    ]),
    [
      { id: "archive", label: "Hồ sơ", href: null },
      { id: "source-3", label: "Hồ sơ", href: null },
      { id: "source-4", label: "Tưởng niệm", href: null },
      { id: "family", label: "Gia đình", href: null },
    ],
  );
});

test("resolveTributeSources keeps absolute HTTP and HTTPS links", () => {
  assert.deepEqual(
    resolveTributeSources([
      { label: "Archive", url: "http://example.org/archive" },
      { label: "Profile", url: "  https://example.org/profile?lang=vi#bio  " },
    ]),
    [
      { id: "source-0", label: "Archive", href: "http://example.org/archive" },
      {
        id: "source-1",
        label: "Profile",
        href: "https://example.org/profile?lang=vi#bio",
      },
    ],
  );
});

test("resolveTributeSources renders unsafe, malformed, and relative links as plain labels", () => {
  const urls = [
    "javascript:void(0)",
    "data:text/plain,archive",
    "ftp://example.org/archive",
    "/archive",
    "archive/index.html",
    "//example.org/archive",
    "https://",
    "",
    " \t ",
  ];

  for (const url of urls) {
    assert.deepEqual(
      resolveTributeSources([{ id: "archive", label: "Archive", url }]),
      [{ id: "archive", label: "Archive", href: null }],
      `Unexpected link for ${JSON.stringify(url)}`,
    );
  }
});

test("resolveBiographyHeading uses the trimmed custom heading", () => {
  assert.equal(
    resolveBiographyHeading(" \tCuộc đời và sứ vụ\n", "Tiểu sử"),
    "Cuộc đời và sứ vụ",
  );
});

test("resolveBiographyHeading uses the supplied default for blank or missing headings", () => {
  assert.equal(resolveBiographyHeading("", "Tiểu sử"), "Tiểu sử");
  assert.equal(resolveBiographyHeading(" \t\n", "Tiểu sử"), "Tiểu sử");
  assert.equal(resolveBiographyHeading(null, "Biography"), "Biography");
  assert.equal(resolveBiographyHeading(undefined, "Tiểu sử"), "Tiểu sử");
});
