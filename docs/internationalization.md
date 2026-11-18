# Internationalization (i18n)

The site supports Vietnamese (`vi`, default) and English (`en`). Fixed UI text
comes from [`next-intl`](https://next-intl.dev) message files; editor-authored
content comes from Payload CMS field localization. The active locale is stored
in a cookie, so URLs carry no locale prefix.

## Where text lives

| Text                                                         | Source                                    | Edited by  |
| ------------------------------------------------------------ | ----------------------------------------- | ---------- |
| Posts, pages, blocks, globals (footer, site settings)        | Payload fields with `localized: true`     | Editors    |
| Fixed UI copy: labels, headings, empty states, `aria-label`s | `messages/vi.json`, `messages/en.json`    | Developers |
| Payload admin UI chrome                                      | `@payloadcms/translations` (`i18n` block) | Upstream   |

Do not branch on the locale inline (`locale === "vi" ? "..." : "..."`) or keep
per-component `{ en, vi }` maps. Add a message key instead.

## Locale resolution

- `src/i18n/config.ts` is the single source of truth for `locales`,
  `defaultLocale`, and `localeLabels`. `payload.config.ts` builds its
  `localization` block from the same values, so the site and the CMS cannot
  drift.
- `src/i18n/request.ts` reads the `locale` cookie on every request and falls
  back to `defaultLocale` when the cookie is missing or holds an unsupported
  value.
- `src/actions/locale.ts` (`setLocale`) is the server action behind
  `src/components/locale-switcher.tsx`. It rejects unsupported locales and
  writes the cookie.
- `src/app/(app)/layout.tsx` sets `<html lang>` and wraps the tree in
  `NextIntlClientProvider`.
- Pass the active locale to Payload queries (`getLocale()` from
  `next-intl/server`) so localized fields resolve in the same language as the
  UI.

### Trade-off of cookie-based locales

There are no `/en/...` URLs. Search engines index one URL per page, in the
default locale, and a shared link opens in the recipient's own cookie locale.
Moving to URL-prefixed locales needs `next-intl` middleware and a
`[locale]` route segment, which also interacts with the existing basic-auth
logic in `src/middleware.ts`.

## Messages

- Keys are grouped by namespace (top-level object): `common` for strings
  shared across features, `navigation`, `posts`, `search`, `notFound`,
  `lightbox`, `postTemplates`, and one namespace per single-use component
  (`contact`, `shareToolbar`).
- Interpolate values with ICU placeholders (`"presenter": "Trình bày: {name}"`,
  `t("presenter", { name })`) instead of concatenating strings, so each
  language controls word order.
- `i18n.d.ts` types messages from `messages/vi.json`, so a key used in code but
  missing from `vi.json` fails `pnpm check-types`. `pnpm test:messages`
  (`tests/messages.test.ts`) catches what the compiler cannot: keys present in
  only one file, mismatched placeholders, and empty strings.
- The site name ("Hội Dòng Đa Minh Gò Vấp") is a proper noun and stays
  untranslated in both locales.

### Adding a string

1. Add the key to `messages/vi.json` and `messages/en.json` under the
   namespace of the feature.
2. Read it with the API that matches the component type (below).
3. Run `pnpm test:messages` and `pnpm check-types`.
4. Switch locales with the locale switcher and check both renderings.

## Usage

Server Components (async):

```tsx
import { getTranslations } from "next-intl/server";

export default async function ShareToolbar() {
  const t = await getTranslations("shareToolbar");
  return <div>{t("title")}</div>;
}
```

Client Components, and non-async Server Components:

```tsx
import { useTranslations } from "next-intl";

function ContactLabel() {
  const t = useTranslations("contact");
  return <span>{t("phoneLabel")}</span>;
}
```

Current locale: `getLocale()` from `next-intl/server` on the server,
`useLocale()` from `next-intl` on the client.
