import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import zlib from "node:zlib";

const PENPOT_PATH = path.resolve("design/da-minh-go-vap.penpot");

/**
 * Minimal ZIP reader using Node built-in zlib to extract all entries from a Buffer.
 */
function readZipEntries(buf: Buffer): Map<string, Buffer> {
  const entries = new Map<string, Buffer>();
  let offset = 0;

  while (offset + 30 <= buf.length) {
    const sig = buf.readUInt32LE(offset);
    if (sig !== 0x04034b50) break;

    const method = buf.readUInt16LE(offset + 8);
    const compressedSize = buf.readUInt32LE(offset + 18);
    const nameLen = buf.readUInt16LE(offset + 26);
    const extraLen = buf.readUInt16LE(offset + 28);

    const nameStart = offset + 30;
    const name = buf.subarray(nameStart, nameStart + nameLen).toString("utf8");
    const dataStart = nameStart + nameLen + extraLen;
    const raw = buf.subarray(dataStart, dataStart + compressedSize);

    const data = method === 8 ? zlib.inflateRawSync(raw) : raw;
    entries.set(name, data);

    offset = dataStart + compressedSize;
  }

  return entries;
}

test("design/da-minh-go-vap.penpot is a valid Penpot v3 archive with all 4 pages, libraries, and responsive viewports", async (t) => {
  try {
    const stat = await fs.stat(PENPOT_PATH);
    assert.ok(stat.size > 0, "Archive should be non-empty");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      t.skip(
        "design/da-minh-go-vap.penpot is gitignored; run pnpm penpot:export to generate and test it locally",
      );
      return;
    }
    throw err;
  }

  const buf = await fs.readFile(PENPOT_PATH);
  assert.equal(
    buf.readUInt32LE(0),
    0x04034b50,
    "Must start with ZIP signature",
  );

  const entries = readZipEntries(buf);
  const manifestBuf = entries.get("manifest.json");
  assert.ok(manifestBuf, "manifest.json must exist in archive");

  const manifest = JSON.parse(manifestBuf.toString("utf8")) as {
    type: string;
    version: number;
    files: Array<{ id: string; name: string; features: string[] }>;
  };
  assert.equal(manifest.type, "penpot/export-files");
  assert.equal(manifest.version, 1);
  assert.equal(manifest.files.length, 1);

  const fileMeta = manifest.files[0];
  assert.ok(fileMeta, "manifest.files[0] must exist");
  const fileJsonBuf = entries.get(`files/${fileMeta.id}.json`);
  assert.ok(fileJsonBuf, `files/${fileMeta.id}.json must exist`);

  const fileJson = JSON.parse(fileJsonBuf.toString("utf8")) as {
    id: string;
    version: number;
    features: string[];
  };
  assert.equal(fileJson.id, fileMeta.id);
  assert.ok(fileJson.version >= 67, "File version should be >= 67");

  const prefix = `files/${fileMeta.id}/`;
  const colorEntries = [...entries.keys()].filter(
    (k) => k.startsWith(`${prefix}colors/`) && k.endsWith(".json"),
  );
  const typoEntries = [...entries.keys()].filter(
    (k) => k.startsWith(`${prefix}typographies/`) && k.endsWith(".json"),
  );
  const compEntries = [...entries.keys()].filter(
    (k) => k.startsWith(`${prefix}components/`) && k.endsWith(".json"),
  );

  assert.ok(colorEntries.length > 0, "Color library should be non-empty");
  assert.ok(typoEntries.length > 0, "Typography library should be non-empty");
  assert.ok(compEntries.length > 0, "Component library should be non-empty");

  const pageMetaEntries = [...entries.keys()].filter((k) =>
    /^files\/[^/]+\/pages\/[^/]+\.json$/.test(k),
  );
  assert.equal(pageMetaEntries.length, 4, "Should have 4 pages");

  const pageNames: string[] = [];
  const allObjectNames: string[] = [];
  const shapeTypes = new Set<string>();

  for (const pageMetaKey of pageMetaEntries) {
    const pageMeta = JSON.parse(entries.get(pageMetaKey)!.toString("utf8")) as {
      id: string;
      name: string;
    };
    pageNames.push(pageMeta.name);

    const shapePrefix = `${prefix}pages/${pageMeta.id}/`;
    const shapeKeys = [...entries.keys()].filter(
      (k) => k.startsWith(shapePrefix) && k.endsWith(".json"),
    );
    assert.ok(
      shapeKeys.length > 1,
      `Page ${pageMeta.name} must have non-empty shape files`,
    );

    for (const shapeKey of shapeKeys) {
      const shape = JSON.parse(entries.get(shapeKey)!.toString("utf8")) as {
        id: string;
        name: string;
        type: string;
        selrect?: unknown;
        points?: unknown[];
        transform?: unknown;
        transformInverse?: unknown;
        svgString?: unknown;
      };
      assert.ok(shape.selrect, `Shape ${shape.id} must have selrect`);
      assert.equal(
        shape.points?.length,
        4,
        `Shape ${shape.id} must have 4 points`,
      );
      assert.ok(shape.transform, `Shape ${shape.id} must have transform`);
      assert.ok(
        shape.transformInverse,
        `Shape ${shape.id} must have transformInverse`,
      );
      assert.equal(
        shape.svgString,
        undefined,
        `Shape ${shape.id} must not have invalid svgString field`,
      );
      shapeTypes.add(shape.type);
      allObjectNames.push(shape.name);
    }
  }

  for (const expectedType of ["frame", "rect", "text", "svg-raw", "image"]) {
    assert.ok(
      shapeTypes.has(expectedType),
      `Expected at least one ${expectedType} shape in archive`,
    );
  }

  const mediaEntries = [...entries.keys()].filter(
    (k) => k.startsWith(`${prefix}media/`) && k.endsWith(".json"),
  );
  assert.ok(mediaEntries.length > 0, "Media entries should be non-empty");

  for (const expected of [
    "01 Foundations",
    "02 UI Components",
    "03 CMS Blocks",
    "04 Page Templates",
  ]) {
    assert.ok(pageNames.includes(expected), `Missing page: ${expected}`);
  }

  for (const vp of ["1440px", "768px", "375px"]) {
    assert.ok(
      allObjectNames.some((name) => name.includes(vp)),
      `Expected artboards for ${vp} viewport`,
    );
  }
});
