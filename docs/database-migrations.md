# Payload CMS 3 Database Migrations Guide

This guide describes how to manage database schema and data migrations for MongoDB using Payload CMS 3.

---

## 1. Overview

Payload CMS supports programmatic migrations that track executed operations in the `payload-migrations` collection within MongoDB. Each migration file contains an `up` and a `down` function.

---

## 2. Available Commands

Run migrations using `pnpm`:

| Action                  | Command                      | Description                                             |
| ----------------------- | ---------------------------- | ------------------------------------------------------- |
| **Create Migration**    | `pnpm migrate:create <name>` | Generates a new migration template in `src/migrations/` |
| **Run Migrations**      | `pnpm migrate`               | Executes all pending migrations against the database    |
| **Check Status**        | `pnpm migrate:status`        | Displays pending vs applied migrations                  |
| **Rollback Migration** | `pnpm migrate:down`          | Rolls back the most recently applied batch              |

---

## 3. Workflow

### 3.1. Creating a Migration

When modifying collections, field names, or data structures:

```bash
pnpm migrate:create update_post_status_enum
```

This generates a file like `src/migrations/20260929_120000_update_post_status_enum.ts`:

```typescript
import { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-mongodb";

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  // Execute data transformations using payload local API or mongoose model
  await payload.update({
    collection: "posts",
    where: { status: { equals: "draft" } },
    data: { status: "unpublished" },
  });
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  // Rollback logic
  await payload.update({
    collection: "posts",
    where: { status: { equals: "unpublished" } },
    data: { status: "draft" },
  });
}
```

### 3.2. Running Migrations in Production

Migrations are executed automatically before starting standalone server builds:

```bash
pnpm migrate
```

---

## 4. References

- [Payload CMS Database Migrations](https://payloadcms.com/docs/database/migrations)
- [@payloadcms/db-mongodb](https://payloadcms.com/docs/database/mongodb)
