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

test("design/da-minh-go-vap.penpot is a valid Penpot archive with all 4 pages, libraries, and responsive viewports", async () => {
  const stat = await fs.stat(PENPOT_PATH);
  assert.ok(stat.size > 0, "Archive should be non-empty");

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
    files: Array<{ id: string; pages: string[] }>;
  };
  assert.equal(manifest.type, "penpot/export-file");
  assert.equal(manifest.files.length, 1);

  const fileMeta = manifest.files[0];
  assert.ok(fileMeta, "manifest.files[0] must exist");
  const fileJsonBuf = entries.get(`files/${fileMeta.id}.json`);
  assert.ok(fileJsonBuf, `files/${fileMeta.id}.json must exist`);

  const fileJson = JSON.parse(fileJsonBuf.toString("utf8")) as {
    pagesIndex: Record<string, { id: string; name: string }>;
    colors: Record<string, unknown>;
    typographies: Record<string, unknown>;
    components: Record<string, unknown>;
  };

  assert.ok(
    Object.keys(fileJson.colors).length > 0,
    "Color library should be non-empty",
  );
  assert.ok(
    Object.keys(fileJson.typographies).length > 0,
    "Typography library should be non-empty",
  );
  assert.ok(
    Object.keys(fileJson.components).length > 0,
    "Component library should be non-empty",
  );

  const pageNames = Object.values(fileJson.pagesIndex).map((p) => p.name);
  for (const expected of [
    "01 Foundations",
    "02 UI Components",
    "03 CMS Blocks",
    "04 Page Templates",
  ]) {
    assert.ok(pageNames.includes(expected), `Missing page: ${expected}`);
  }

  const allObjectNames: string[] = [];
  for (const pageId of fileMeta.pages) {
    const pageBuf = entries.get(`files/${fileMeta.id}/pages/${pageId}.json`);
    assert.ok(pageBuf, `Page JSON ${pageId} must exist`);
    const pageJson = JSON.parse(pageBuf.toString("utf8")) as {
      objects: Record<string, { name: string }>;
    };
    const objs = Object.values(pageJson.objects);
    assert.ok(objs.length > 1, `Page ${pageId} must have non-empty objects`);
    for (const obj of objs) {
      allObjectNames.push(obj.name);
    }
  }

  for (const vp of ["1440px", "768px", "375px"]) {
    assert.ok(
      allObjectNames.some((name) => name.includes(vp)),
      `Expected artboards for ${vp} viewport`,
    );
  }
});
