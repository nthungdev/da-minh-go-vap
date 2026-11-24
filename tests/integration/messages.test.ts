import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

type Messages = { [key: string]: string | Messages };

function load(locale: string): Messages {
  const url = new URL(`../../messages/${locale}.json`, import.meta.url);
  return JSON.parse(readFileSync(url, "utf8"));
}

/** Flattens nested messages into "namespace.key" -> value. */
function flatten(messages: Messages, prefix = ""): Map<string, string> {
  const result = new Map<string, string>();
  for (const [key, value] of Object.entries(messages)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      result.set(path, value);
    } else {
      for (const entry of flatten(value, path)) result.set(...entry);
    }
  }
  return result;
}

function placeholders(message: string): string[] {
  return [...message.matchAll(/\{(\w+)\}/g)]
    .map((match) => match[1] ?? "")
    .sort();
}

const vi = flatten(load("vi"));
const en = flatten(load("en"));

test("vi and en define the same message keys", () => {
  // vi.json is the type source (i18n.d.ts), so a key missing from en.json is invisible to tsc.
  assert.deepEqual([...en.keys()].sort(), [...vi.keys()].sort());
});

test("translations use the same placeholders", () => {
  for (const [key, viMessage] of vi) {
    const enMessage = en.get(key);
    if (enMessage === undefined) continue;
    assert.deepEqual(placeholders(enMessage), placeholders(viMessage), key);
  }
});

test("no message is empty", () => {
  for (const [key, message] of [...vi, ...en]) {
    assert.notEqual(message.trim(), "", key);
  }
});

test("contributor listing and role messages exist in vi and en", () => {
  const keys = [
    "posts.byContributor",
    "posts.contributorRoles.author.one",
    "posts.contributorRoles.translator.one",
    "posts.contributorRoles.narrator.one",
    "posts.contributorRoles.editor.one",
    "posts.contributorRoles.presenter.one",
  ];
  for (const key of keys) {
    assert.ok(vi.get(key), `vi ${key}`);
    assert.ok(en.get(key), `en ${key}`);
  }
  assert.deepEqual(placeholders(vi.get("posts.byContributor") ?? ""), ["name"]);
});
