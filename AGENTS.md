# Agent Guidelines & Development Standards

Welcome to the **Đa Minh Gò Vấp** project codebase. This document outlines the core conventions, engineering rules, and development workflows for AI agents and human contributors working on this repository.

---

## 1. Project Overview & Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack dev, React 19)
- **CMS**: Payload CMS 3 (MongoDB via `@payloadcms/db-mongodb`, Lexical RichText, Media S3)
- **Styling**: Tailwind CSS v4, `clsx`, `tailwind-merge` via `@/utils/common` (`cn`)
- **UI Components**: Shadcn UI / Radix primitives / Lucide Icons / Preline UI
- **Language**: TypeScript 5.8+ (Strict type checking)
- **Package Manager**: `pnpm` (`pnpm@11.x` / `>= 10.13.1`)

---

## 2. Essential Commands

Always use `pnpm` to run package scripts:

| Action                      | Command                              | Description                                           |
| --------------------------- | ------------------------------------ | ----------------------------------------------------- |
| **Development**             | `pnpm dev`                           | Starts Next.js dev server with Turbopack              |
| **Type Check**              | `pnpm check-types`                   | Validates TypeScript types (`tsc --noemit`)           |
| **Lint**                    | `pnpm lint`                          | Runs ESLint across the codebase                       |
| **Lint & Fix**              | `pnpm lint:fix`                      | Runs ESLint auto-fix and Prettier formatting          |
| **Prettier Check**          | `pnpm prettier`                      | Checks code formatting                                |
| **Prettier Fix**            | `pnpm prettier:fix`                  | Formats all files with Prettier                       |
| **Production Build**        | `pnpm build`                         | Generates the Next.js production build                |
| **Payload Generate**        | `pnpm generate`                      | Regenerates Payload types and import map              |
| **Local Database**          | `pnpm db:up` / `pnpm db:down`        | Starts/stops MongoDB dev container via Docker Compose |
| **Database Backup/Restore** | `pnpm db:backup` / `pnpm db:restore` | Runs database backup and restore shell scripts        |

---

## 3. Core Development Rules

### 3.1. Always Run Lint and Format at the End

Whenever you make changes, verify and format the codebase before submitting or committing:

1. Run `pnpm lint:fix` (or `pnpm lint` and `pnpm prettier:fix`).
2. Run `pnpm check-types` to ensure zero TypeScript errors.
3. Fix any reported warnings or errors before marking tasks as complete.

```bash
# End-of-task verification pipeline
pnpm lint:fix
pnpm check-types
```

---

### 3.2. Use `cn` for Conditional and Dynamic Class Names

Always import and use the `cn` utility function from `@/utils/common` (which combines `clsx` and `twMerge`) when composing conditional, variant, or dynamic Tailwind class names.

- **Do NOT** use raw string interpolation (template literals) for conditional Tailwind classes.
- **Do NOT** use `twMerge` or `clsx` separately in components—use `cn(...)`.

```tsx
// ✅ Good: Using cn from @/utils/common
import { cn } from "@/utils/common";

interface ButtonProps {
  isActive?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function CustomButton({ isActive, className, children }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
        "bg-white text-gray-800 hover:bg-gray-100",
        isActive &&
          "bg-primary-50 text-primary-700 border-primary-500 font-semibold",
        className,
      )}
    >
      {children}
    </button>
  );
}

// ❌ Bad: Template literal concatenation or manual class merging
export function BadButton({
  isActive,
  className,
}: {
  isActive?: boolean;
  className?: string;
}) {
  return (
    <button
      className={`px-4 py-2 ${isActive ? "bg-primary-50 text-primary-700" : "bg-white"} ${className || ""}`}
    >
      Click
    </button>
  );
}
```

---

### 3.3. Avoid Convoluted Lambda Chaining without Comments

Code readability and maintainability are critical. Do not write long, dense, or unreadable functional chains without intermediate variables and clear commentary.

- Break complex operations down into well-named steps with clear intermediate types or variables.
- Add explanatory comments for business logic, tricky edge cases, or sorting/reduction pipelines.
- Keep inline arrow callbacks simple (1–2 expressions max). If an inline callback requires multiple branches or complex logic, extract it to a standalone helper function.

```typescript
// ✅ Good: Readable transformations with well-named intermediate variables and comments
// Group posts by primary tag and filter out drafts
const publishedPosts = posts.filter((post) => post.status === "published");

// Group published posts into category buckets for tabbed navigation
const postsByCategory = publishedPosts.reduce<Record<string, Post[]>>(
  (acc, post) => {
    const categoryKey = post.category?.slug ?? "uncategorized";
    if (!acc[categoryKey]) {
      acc[categoryKey] = [];
    }
    acc[categoryKey].push(post);
    return acc;
  },
  {},
);

// ❌ Bad: Dense, unreadable chaining with nested ternaries and no comments
const result = raw
  .filter((x) => x.s === "p" && x.c)
  .map((x) => ({ ...x, d: x.d ? new Date(x.d).getTime() : 0 }))
  .sort((a, b) => (b.p ? 1 : 0) - (a.p ? 1 : 0) || b.d - a.d)
  .reduce(
    (a: any, c: any) => ({ ...a, [c.c.s]: [...(a[c.c.s] || []), c] }),
    {},
  );
```

---

### 3.4. Add JSDoc When Needed (No Need for Trivial Code)

Use JSDoc comments to document public interfaces, non-obvious algorithms, utility functions, and Payload collection hooks.

- **Include JSDoc for**:
  - Exported utility functions with parameters and return values.
  - Complex custom hooks and context providers.
  - Non-trivial data transformation helpers.
  - Functions with subtle edge cases, fallback behaviors, or invariants.
- **Skip JSDoc for**:
  - Simple, straight-forward components or one-liners (e.g. `const isEven = (n: number) => n % 2 === 0`).
  - Obvious getters/setters or trivial pass-through wrappers.
  - Self-explanatory React component props already clearly typed via TypeScript.

```typescript
// ✅ Good: Targeted JSDoc explaining behavior and parameters
/**
 * Recursively resolves menu item hierarchy and computes the active state
 * against the current URL pathname.
 *
 * @param items - List of top-level navigation items configured in Payload CMS.
 * @param currentPath - Current route pathname from Next.js `usePathname()`.
 * @returns Menu items with attached `isActive` flags and normalized link targets.
 */
export function resolveActiveMenuItems(
  items: MenuItem[],
  currentPath: string,
): ResolvedMenuItem[] {
  // Implementation...
}

// ❌ Bad: Redundant / spammy JSDoc for trivial code
/**
 * Sums two numbers
 * @param a - The first number
 * @param b - The second number
 * @returns The sum
 */
export const add = (a: number, b: number) => a + b;
```

---

## 4. Payload CMS & Next.js Guidelines

1. **Client vs. Server Components**:
   - Keep data fetching and Payload Local API operations in Server Components.
   - Use `"use client"` only for components requiring interactivity, state, event listeners, or client hooks.
2. **Schema & Type Synchronization**:
   - Whenever modifying Payload globals (e.g., `src/payload/globals/NavBar.ts`) or collections, update the corresponding TypeScript definitions in `src/utils/` and run `pnpm generate:types`.
3. **Optimized Media & Navigation**:
   - Always use `next/image` (`<Image />`) for rendering images with explicit sizes/aspect ratios.
   - Use `next/link` (`<Link />`) for internal routing.
