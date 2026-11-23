import assert from "node:assert/strict";
import test from "node:test";
import type { AccessArgs, CollectionBeforeChangeHook } from "payload";
import type { Post, User } from "@/payload-types";
import {
  onlyRoles,
  onlySelfAndRoles,
  postsDeleteAccess,
  stampCreatedBy,
} from "./access-control.ts";

function makeReq(user?: Pick<User, "id" | "role">) {
  return { user } as AccessArgs<Post>["req"];
}

type BeforeChangeArgs = Parameters<CollectionBeforeChangeHook>[0];

function runStampCreatedBy(args: {
  data: Record<string, unknown>;
  operation: "create" | "update";
  user?: Pick<User, "id" | "role">;
}) {
  return stampCreatedBy({
    data: args.data,
    operation: args.operation,
    req: makeReq(args.user),
  } as BeforeChangeArgs);
}

test("onlyRoles allows matching roles and rejects missing or non-matching users", () => {
  const check = onlyRoles(["admin", "author"]);
  assert.equal(check({ req: makeReq() }), false);
  assert.equal(check({ req: makeReq({ id: "u1", role: "editor" }) }), false);
  assert.equal(check({ req: makeReq({ id: "u1", role: "author" }) }), true);
  assert.equal(check({ req: makeReq({ id: "u2", role: "admin" }) }), true);
});

test("onlySelfAndRoles allows allowed roles or matching self id", () => {
  const check = onlySelfAndRoles(["admin", "manager"]);
  assert.equal(check({ req: makeReq(), id: "u1" }), false);
  assert.equal(
    check({ req: makeReq({ id: "u1", role: "author" }), id: "u1" }),
    true,
  );
  assert.equal(
    check({ req: makeReq({ id: "u1", role: "author" }), id: "u2" }),
    false,
  );
  assert.equal(
    check({ req: makeReq({ id: "u3", role: "manager" }), id: "u2" }),
    true,
  );
});

test("postsDeleteAccess allows admins and managers to delete any post", () => {
  assert.equal(
    postsDeleteAccess({ req: makeReq({ id: "a1", role: "admin" }) }),
    true,
  );
  assert.equal(
    postsDeleteAccess({ req: makeReq({ id: "m1", role: "manager" }) }),
    true,
  );
});

test("postsDeleteAccess restricts authors to deleting only their own posts", () => {
  assert.deepEqual(
    postsDeleteAccess({ req: makeReq({ id: "author-1", role: "author" }) }),
    {
      createdBy: {
        equals: "author-1",
      },
    },
  );
});

test("postsDeleteAccess denies unauthenticated users and editors", () => {
  assert.equal(postsDeleteAccess({ req: makeReq() }), false);
  assert.equal(
    postsDeleteAccess({ req: makeReq({ id: "e1", role: "editor" }) }),
    false,
  );
});

test("stampCreatedBy sets createdBy to current user on create", () => {
  const result = runStampCreatedBy({
    data: { title: "Hello" },
    operation: "create",
    user: { id: "author-1", role: "author" },
  });
  assert.deepEqual(result, { title: "Hello", createdBy: "author-1" });
});

test("stampCreatedBy prevents non-admins from spoofing createdBy on create", () => {
  const result = runStampCreatedBy({
    data: { title: "Hello", createdBy: "someone-else" },
    operation: "create",
    user: { id: "author-1", role: "author" },
  });
  assert.deepEqual(result, { title: "Hello", createdBy: "author-1" });
});

test("stampCreatedBy preserves explicit createdBy when admin creates a post", () => {
  const result = runStampCreatedBy({
    data: { title: "Hello", createdBy: "author-2" },
    operation: "create",
    user: { id: "admin-1", role: "admin" },
  });
  assert.deepEqual(result, { title: "Hello", createdBy: "author-2" });
});

test("stampCreatedBy leaves data unchanged on update or without an authenticated user", () => {
  const updateData = { title: "Updated" };
  assert.equal(
    runStampCreatedBy({
      data: updateData,
      operation: "update",
      user: { id: "author-1", role: "author" },
    }),
    updateData,
  );

  const systemData = { title: "Seeded" };
  assert.equal(
    runStampCreatedBy({
      data: systemData,
      operation: "create",
    }),
    systemData,
  );
});
