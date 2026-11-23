import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import * as nodeModule from "node:module";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import type {
  Access,
  AccessArgs,
  CollectionConfig,
  Field,
  FieldHook,
} from "payload";
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

const { default: Contributors } = (await import("./contributors.ts")) as {
  default: CollectionConfig;
};
const { contributorRoles } = await import("@/utils/post-contributors");

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

function getSlugHook(kind: "beforeValidate" | "beforeDuplicate"): FieldHook {
  const field = Contributors.fields.find(
    (f): f is Extract<Field, { type: "text" }> =>
      f.type === "text" && f.name === "slug",
  );
  assert.ok(field, "slug field exists");
  const hook = field.hooks?.[kind]?.[0];
  assert.equal(typeof hook, "function", `slug ${kind} hook is defined`);
  return hook as FieldHook;
}

type CountArgs = { where: Record<string, unknown> };
type FindByIDArgs = { id: string; locale: string; fallbackLocale: unknown };

function makeSlugReq({
  locale = "vi",
  takenSlugs = [] as string[],
  defaultLocaleName,
}: {
  locale?: string;
  takenSlugs?: string[];
  defaultLocaleName?: string | null;
} = {}) {
  const countCalls: CountArgs[] = [];
  const findByIDCalls: FindByIDArgs[] = [];
  const payload = {
    count: async (args: CountArgs) => {
      countCalls.push(args);
      const slug = (args.where.slug as { equals: string }).equals;
      return { totalDocs: takenSlugs.includes(slug) ? 1 : 0 };
    },
    findByID: async (args: FindByIDArgs) => {
      findByIDCalls.push(args);
      return { id: args.id, name: defaultLocaleName };
    },
  };
  return { req: { locale, payload }, countCalls, findByIDCalls };
}

function runSlugHook(args: {
  value?: unknown;
  data?: Record<string, unknown>;
  originalDoc?: Record<string, unknown>;
  req: unknown;
}) {
  return getSlugHook("beforeValidate")(
    args as unknown as Parameters<FieldHook>[0],
  );
}

test("slug hook generates the slug from the name when empty", async () => {
  const { req, countCalls } = makeSlugReq();
  const slug = await runSlugHook({
    value: "",
    data: { name: "Giuse Nguyễn Văn Đức" },
    req,
  });
  assert.equal(slug, "giuse-nguyen-van-duc");
  assert.equal(countCalls.length, 1);
  assert.deepEqual(countCalls[0]?.where, {
    slug: { equals: "giuse-nguyen-van-duc" },
  });
});

test("slug hook keeps a provided slug without querying", async () => {
  const { req, countCalls, findByIDCalls } = makeSlugReq({
    locale: "en",
    takenSlugs: ["custom-slug"],
  });
  const slug = await runSlugHook({
    value: "custom-slug",
    data: { name: "Other Name" },
    originalDoc: { id: "c1" },
    req,
  });
  assert.equal(slug, "custom-slug");
  assert.equal(countCalls.length, 0);
  assert.equal(findByIDCalls.length, 0);
});

test("slug hook appends a 4-char suffix when the generated slug is taken", async () => {
  const { req, countCalls } = makeSlugReq({ takenSlugs: ["da-minh"] });
  const slug = await runSlugHook({
    value: undefined,
    data: { name: "Đa Minh" },
    originalDoc: { id: "c1" },
    req,
  });
  assert.match(String(slug), /^da-minh-[a-z0-9]{4}$/);
  // The current document must not count as a collision with itself.
  assert.deepEqual(countCalls[0]?.where, {
    slug: { equals: "da-minh" },
    id: { not_equals: "c1" },
  });
});

test("slug hook uses the vi name when editing in en", async () => {
  const { req, findByIDCalls } = makeSlugReq({
    locale: "en",
    defaultLocaleName: "Phêrô Trần",
  });
  const slug = await runSlugHook({
    value: "",
    data: { name: "Peter Tran EN" },
    originalDoc: { id: "c1" },
    req,
  });
  assert.equal(slug, "phero-tran");
  assert.equal(findByIDCalls.length, 1);
  assert.equal(findByIDCalls[0]?.id, "c1");
  assert.equal(findByIDCalls[0]?.locale, "vi");
  assert.equal(findByIDCalls[0]?.fallbackLocale, false);
});

test("slug hook falls back to the request name when the vi name is empty", async () => {
  const { req } = makeSlugReq({ locale: "en", defaultLocaleName: null });
  const slug = await runSlugHook({
    value: "",
    data: { name: "Peter Tran" },
    originalDoc: { id: "c1" },
    req,
  });
  assert.equal(slug, "peter-tran");
});

test("slug hook reads the vi entry of a locale=all name object", async () => {
  const { req } = makeSlugReq({ locale: "all" as string });
  const slug = await runSlugHook({
    value: "",
    data: { name: { vi: "Maria Lê Thị Hồng", en: "Mary Le" } },
    req,
  });
  assert.equal(slug, "maria-le-thi-hong");
});

test("slug hook leaves the value alone when no usable name exists", async () => {
  const { req, countCalls } = makeSlugReq();
  assert.equal(await runSlugHook({ value: "", data: {}, req }), "");
  assert.equal(
    await runSlugHook({ value: undefined, data: { name: "!!!" }, req }),
    undefined,
  );
  assert.equal(countCalls.length, 0);
});

test("slug validate rejects an empty slug from an unslugifiable name", async () => {
  const field = Contributors.fields.find(
    (f): f is Extract<Field, { type: "text" }> =>
      f.type === "text" && f.name === "slug",
  );
  assert.ok(field?.validate, "slug validate is defined");
  const validate = field.validate as (value: unknown) => unknown;

  const { req } = makeSlugReq();
  const generated = await runSlugHook({
    value: undefined,
    data: { name: "???" },
    req,
  });
  const message = "Không thể tạo slug từ tên này, vui lòng nhập slug";
  assert.equal(validate(generated), message);
  assert.equal(validate(""), message);
  assert.equal(validate("   "), message);
  assert.equal(validate(null), message);
  assert.equal(validate("giuse"), true);
  assert.equal(validate("Bad Slug"), "Invalid slug");
});

test("slug beforeDuplicate appends a random suffix", () => {
  const hook = getSlugHook("beforeDuplicate");
  const call = (value: unknown) =>
    hook({ value } as unknown as Parameters<FieldHook>[0]);
  assert.match(String(call("da-minh")), /^da-minh-[a-z0-9]{4}$/);
  assert.equal(call(""), "");
  assert.equal(call(undefined), undefined);
});

type RevalidationHook = (args: unknown) => Promise<unknown>;

function getRevalidationHook(kind: "afterChange" | "afterDelete") {
  const hook = Contributors.hooks?.[kind]?.[0];
  assert.equal(typeof hook, "function", `${kind} hook is defined`);
  return hook as unknown as RevalidationHook;
}

for (const kind of ["afterChange", "afterDelete"] as const) {
  test(`${kind} revalidation queries posts by contributors.person`, async (t) => {
    const findCalls: Record<string, unknown>[] = [];
    const revalidated: string[] = [];
    const previousSecret = process.env.REVALIDATION_SECRET;
    process.env.REVALIDATION_SECRET = "test-secret";
    t.after(() => {
      if (previousSecret === undefined) delete process.env.REVALIDATION_SECRET;
      else process.env.REVALIDATION_SECRET = previousSecret;
    });
    t.mock.method(
      globalThis,
      "fetch",
      async (_url: string, init: RequestInit) => {
        revalidated.push(JSON.parse(String(init.body)).path);
        return new Response(null, { status: 200 });
      },
    );
    const req = {
      payload: {
        find: async (args: Record<string, unknown>) => {
          findCalls.push(args);
          return { docs: [{ slug: "bai-viet" }, { slug: null }] };
        },
        logger: { error: () => {} },
      },
    };
    await getRevalidationHook(kind)({ doc: { id: "c1" }, req });
    assert.equal(findCalls.length, 1);
    assert.equal(findCalls[0]?.collection, "posts");
    assert.deepEqual(findCalls[0]?.where, {
      "contributors.person": { in: ["c1"] },
    });
    assert.deepEqual(revalidated.sort(), ["/", "/posts/bai-viet"]);
  });

  test(`${kind} revalidation swallows and logs lookup errors`, async () => {
    const logged: unknown[] = [];
    const req = {
      payload: {
        find: async () => {
          throw new Error("db down");
        },
        logger: { error: (entry: unknown) => logged.push(entry) },
      },
    };
    await assert.doesNotReject(
      getRevalidationHook(kind)({ doc: { id: "c1" }, req }),
    );
    assert.equal(logged.length, 1);
  });
}

function getRowFields(): ts.ObjectLiteralExpression[] {
  const contributors = getContentTabFields().at(-1);
  assert.ok(contributors);
  const fields = getProperty(contributors, "fields");
  assert.ok(fields && ts.isArrayLiteralExpression(fields));
  const row = fields.elements.find(
    (el): el is ts.ObjectLiteralExpression =>
      ts.isObjectLiteralExpression(el) &&
      getStringProperty(el, "type") === "row",
  );
  assert.ok(row, "contributors rows are laid out in a row");
  const rowFields = getProperty(row, "fields");
  assert.ok(rowFields && ts.isArrayLiteralExpression(rowFields));
  return rowFields.elements.filter(ts.isObjectLiteralExpression);
}

function findByName(fields: ts.ObjectLiteralExpression[], name: string) {
  const field = fields.find((f) => getStringProperty(f, "name") === name);
  assert.ok(field, `${name} field exists`);
  return field;
}

function isTrue(object: ts.ObjectLiteralExpression, name: string) {
  return getProperty(object, name)?.kind === ts.SyntaxKind.TrueKeyword;
}

test("posts contributors rows have a required person relationship", () => {
  const rowFields = getRowFields();
  assert.deepEqual(
    rowFields.map((f) => getStringProperty(f, "name")),
    ["person", "role"],
  );
  const person = findByName(rowFields, "person");
  assert.equal(getStringProperty(person, "type"), "relationship");
  assert.equal(getStringProperty(person, "relationTo"), "contributors");
  assert.ok(isTrue(person, "required"), "person is required");
});

test("posts contributors rows have a required role select defaulting to author", () => {
  const role = findByName(getRowFields(), "role");
  assert.equal(getStringProperty(role, "type"), "select");
  assert.ok(isTrue(role, "required"), "role is required");
  assert.equal(getStringProperty(role, "defaultValue"), "author");

  // `options` is built as `contributorRoles.map(...)`, so check that source and its keys.
  const options = getProperty(role, "options");
  assert.ok(options && ts.isIdentifier(options));
  const declaration = findVariableInitializer(options.text);
  assert.ok(
    declaration &&
      ts.isCallExpression(declaration) &&
      ts.isPropertyAccessExpression(declaration.expression) &&
      ts.isIdentifier(declaration.expression.expression) &&
      declaration.expression.expression.text === "contributorRoles" &&
      declaration.expression.name.text === "map",
    "role options are derived from contributorRoles",
  );
  const labels = findVariableInitializer("contributorRoleLabels");
  assert.ok(labels && ts.isObjectLiteralExpression(labels));
  assert.deepEqual(
    labels.properties.map(
      (p) => p.name && ts.isIdentifier(p.name) && p.name.text,
    ),
    [...contributorRoles],
  );
});

function findVariableInitializer(name: string): ts.Expression | undefined {
  const fileName = fileURLToPath(new URL("./posts.ts", import.meta.url));
  const source = ts.createSourceFile(
    fileName,
    readFileSync(fileName, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const decl of statement.declarationList.declarations) {
      if (ts.isIdentifier(decl.name) && decl.name.text === name) {
        return decl.initializer;
      }
    }
  }
  return undefined;
}
