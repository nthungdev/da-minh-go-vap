import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import * as nodeModule from "node:module";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Access, AccessArgs, CollectionConfig } from "payload";
import ts from "typescript";
import type { User } from "@/payload-types";

const srcRoot = new URL("../../", import.meta.url);

type ResolveHook = (
  specifier: string,
  context: object,
  nextResolve: (specifier: string, context: object) => unknown,
) => unknown;

// Available in the Node runtime, but missing from the installed @types/node.
const { registerHooks } = nodeModule as unknown as {
  registerHooks: (hooks: { resolve: ResolveHook }) => void;
};

// node --test has no tsconfig path mapping, so resolve "@/..." to src/*.ts here.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const base = fileURLToPath(new URL(specifier.slice(2), srcRoot));
      for (const candidate of [`${base}.ts`, `${base}/index.ts`]) {
        if (existsSync(candidate)) {
          return nextResolve(pathToFileURL(candidate).href, context);
        }
      }
    }
    return nextResolve(specifier, context);
  },
});

const { default: Contributors } = (await import("./Contributors.ts")) as {
  default: CollectionConfig;
};

function makeArgs(
  user?: Pick<User, "id" | "role"> | { id: string; role: string },
) {
  return { req: { user } } as AccessArgs;
}

function getAccess(operation: "read" | "create" | "update" | "delete"): Access {
  const access = Contributors.access?.[operation];
  assert.equal(typeof access, "function", `${operation} access is defined`);
  return access as Access;
}

const editorRoles = ["admin", "manager", "editor", "author"] as const;
const writeOperations = ["create", "update", "delete"] as const;

test("Contributors collection uses the contributors slug", () => {
  assert.equal(Contributors.slug, "contributors");
});

test("Contributors read access is public", () => {
  const read = getAccess("read");
  assert.equal(read(makeArgs()), true);
  assert.equal(read(makeArgs({ id: "u1", role: "author" })), true);
});

for (const operation of writeOperations) {
  test(`Contributors ${operation} access allows content roles`, () => {
    const check = getAccess(operation);
    for (const role of editorRoles) {
      assert.equal(check(makeArgs({ id: `u-${role}`, role })), true, role);
    }
  });

  test(`Contributors ${operation} access denies anonymous and unknown roles`, () => {
    const check = getAccess(operation);
    assert.equal(check(makeArgs()), false);
    assert.equal(check(makeArgs({ id: "u-x", role: "viewer" })), false);
    assert.equal(check(makeArgs({ id: "u-y", role: "" })), false);
  });
}

/**
 * posts.ts pulls in TSX blocks that plain node cannot load, so the `contributors`
 * field is checked from the parsed source of the "Nội Dung" tab instead.
 */
function getContentTabFields(): ts.ObjectLiteralExpression[] {
  const fileName = fileURLToPath(new URL("./posts.ts", import.meta.url));
  const source = ts.createSourceFile(
    fileName,
    readFileSync(fileName, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );

  let tabFields: ts.ArrayLiteralExpression | undefined;
  const visit = (node: ts.Node) => {
    if (tabFields) return;
    if (
      ts.isObjectLiteralExpression(node) &&
      getStringProperty(node, "label") === "Nội Dung"
    ) {
      const fields = getProperty(node, "fields");
      if (fields && ts.isArrayLiteralExpression(fields)) tabFields = fields;
    }
    ts.forEachChild(node, visit);
  };
  visit(source);

  assert.ok(tabFields, 'posts has a "Nội Dung" tab with fields');
  return tabFields.elements.filter(ts.isObjectLiteralExpression);
}

function getProperty(object: ts.ObjectLiteralExpression, name: string) {
  for (const property of object.properties) {
    if (
      ts.isPropertyAssignment(property) &&
      ts.isIdentifier(property.name) &&
      property.name.text === name
    ) {
      return property.initializer;
    }
  }
  return undefined;
}

function getStringProperty(object: ts.ObjectLiteralExpression, name: string) {
  const value = getProperty(object, name);
  return value && ts.isStringLiteral(value) ? value.text : undefined;
}

test('posts contributors field is the last field of the "Nội Dung" tab', () => {
  const fields = getContentTabFields();
  const last = fields.at(-1);
  assert.ok(last);
  assert.equal(getStringProperty(last, "name"), "contributors");
  assert.equal(getStringProperty(last, "type"), "array");
});
