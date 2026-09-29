# Internationalization (i18n) Architecture

This document outlines the internationalization architecture implemented in the
Đa Minh Gò Vấp platform.

---

## 1. Selected Library: `next-intl`

After evaluating `next-i18next`, `react-i18next`, and `next-intl`,
**`next-intl`** was chosen for the following reasons:

- **Full Next.js App Router & Server Components Support**: Works natively in
  React Server Components without client-side hydration overhead.
- **Type-safe Messages**: Full TypeScript completion for translation keys
  defined in `messages/*.json`.
- **Payload CMS Compatibility**: Works smoothly alongside Payload CMS's
  field-level localization (`localized: true`).

---

## 2. Configuration & Structure

- **Supported Locales**: `vi` (Vietnamese, default), `en` (English).
- **Configuration**: Defined in `src/i18n/config.ts` and `src/i18n/request.ts`.
- **Next.js Integration**: Configured in `next.config.ts` via
  `createNextIntlPlugin()`.
- **Translation Files**: Stored under `messages/vi.json` and `messages/en.json`.

---

## 3. Usage Examples

### 3.1. Server Components

```tsx
import { getTranslations } from "next-intl/server";

export default async function Component() {
  const t = await getTranslations("Navigation");
  return <nav>{t("home")}</nav>;
}
```

### 3.2. Client Components

```tsx
"use client";

import { useTranslations } from "next-intl";

export default function ClientButton() {
  const t = useTranslations("Common");
  return <button>{t("submit")}</button>;
}
```
