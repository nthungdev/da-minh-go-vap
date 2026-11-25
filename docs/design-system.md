# Design system and tokens

Public storefront styles live in [src/app/(app)/globals.css](<../src/app/(app)/globals.css>) and compile with Tailwind CSS v4. Payload CMS admin styles under `src/app/(payload)` are isolated from this stylesheet and must remain independent.

All semantic color pairings meet WCAG 2.1 AA contrast (`>= 4.5:1` for normal text and `>= 3.0:1` for focus rings and UI borders). Automated assertions in [tests/integration/design-tokens.test.ts](../tests/integration/design-tokens.test.ts) verify these ratios against the compiled CSS.

## Token layers

The stylesheet separates tokens into three layers:

1. **Static tokens (`@theme`)**: Brand primitive palettes (`chill`, `secondary`, `keppel`, `matisse`, `dodger-blue`, `gun-powder`, `light-apricot`, `viola`), editorial surface and ink tokens, typography sizes, spacing rhythm, container widths, and shadows.
2. **Runtime semantic tokens (`:root` and `.dark`)**: Theme-aware CSS custom properties for surfaces, foregrounds, borders, brand actions, and status feedback.
3. **Tailwind inline mappings (`@theme inline`)**: Bridges runtime variables and font stacks (`next/font/local` variables loaded in [src/app/(app)/[locale]/layout.tsx](<../src/app/(app)/[locale]/layout.tsx>)) to standard Tailwind utility classes.

## Semantic color tokens

Use semantic utilities (`bg-surface`, `text-foreground`, `border-border`, `text-success`) instead of raw hex values or arbitrary palette shades.

### Surfaces and foregrounds

| Role             | Utility class                                     | Light value | Dark value | Usage                                        |
| ---------------- | ------------------------------------------------- | ----------- | ---------- | -------------------------------------------- |
| Page background  | `bg-background`                                   | `#ffffff`   | `#0b1220`  | Root document canvas                         |
| Default surface  | `bg-surface` / `bg-card`                          | `#ffffff`   | `#111a2c`  | Cards, panels, drawers                       |
| Muted surface    | `bg-surface-muted` / `bg-muted`                   | `#f4f4f5`   | `#1e293b`  | Secondary containers, skeletons, hover fills |
| Elevated surface | `bg-surface-elevated` / `bg-popover`              | `#ffffff`   | `#172236`  | Popovers, menus, dialogs                     |
| Primary text     | `text-foreground`                                 | `#111827`   | `#f8fafc`  | Headings and body copy                       |
| Secondary text   | `text-foreground-muted` / `text-muted-foreground` | `#4b5563`   | `#cbd5e1`  | Metadata, captions, helper copy              |

Editorial templates also use warm reading surfaces (`bg-surface-warm`, `bg-surface-paper`, `bg-surface-header`, `border-border-warm`) and callout tokens (`bg-callout-bg`, `border-callout-border`, `text-callout-text`).

### Borders and focus rings

| Role              | Utility class          | Light value | Dark value | Usage                                              |
| ----------------- | ---------------------- | ----------- | ---------- | -------------------------------------------------- |
| Default border    | `border-border`        | `#e5e7eb`   | `#334155`  | Cards, dividers, tables                            |
| Subtle border     | `border-border-subtle` | `#f1f5f9`   | `#1e293b`  | Low-emphasis internal rules                        |
| Strong border     | `border-border-strong` | `#6b7280`   | `#94a3b8`  | Interactive boundaries requiring `>= 3:1` contrast |
| Form input border | `border-input`         | `#d1d5db`   | `#475569`  | Text inputs, selects, textareas                    |
| Focus ring        | `ring-ring`            | `#0b6f7f`   | `#70c7d0`  | Keyboard `:focus-visible` outlines                 |

### Brand and accent

| Role             | Utility class                     | Light value | Dark value | Brand source                      |
| ---------------- | --------------------------------- | ----------- | ---------- | --------------------------------- |
| Primary action   | `bg-primary` / `text-primary`     | `#0b6f7f`   | `#70c7d0`  | `chill-800` / `chill-4`           |
| Primary label    | `text-primary-foreground`         | `#ffffff`   | `#023d4a`  | White / `chill-950`               |
| Secondary action | `bg-secondary` / `text-secondary` | `#c2410c`   | `#fb923c`  | `secondary-700` / `secondary-400` |
| Secondary label  | `text-secondary-foreground`       | `#ffffff`   | `#431407`  | White / `secondary-950`           |
| Accent surface   | `bg-accent`                       | `#eafffd`   | `#0e2523`  | `chill-50` / `keppel-950`         |
| Accent label     | `text-accent-foreground`          | `#0e5b6b`   | `#daf2f3`  | `chill-900` / `chill-1`           |

### Status tokens

Status tokens map directly to the brand palette (`keppel` for success, `secondary` for warning, calibrated red for error, `matisse` for info).

| Status              | Foreground / fill (`text-*`, `bg-*`) | On-fill label (`text-*-foreground`) | Subtle background (`bg-*-subtle`) | Border (`border-*-border`)  |
| ------------------- | ------------------------------------ | ----------------------------------- | --------------------------------- | --------------------------- |
| Success             | `#275e54` (`keppel-700`)             | `#ffffff`                           | `#f3faf7` (`keppel-50`)           | `#2c7568` (`keppel-600`)    |
| Warning             | `#9a3412` (`secondary-800`)          | `#ffffff`                           | `#fff7ed` (`secondary-50`)        | `#c2410c` (`secondary-700`) |
| Error / destructive | `#b91c1c`                            | `#ffffff`                           | `#fef2f2`                         | `#dc2626`                   |
| Info                | `#27537d` (`matisse-700`)            | `#ffffff`                           | `#f3f7fc` (`matisse-50`)          | `#2f689d` (`matisse-600`)   |

## Contrast guarantees

Light theme ratios verified against `#ffffff` and paired subtle surfaces:

| Pairing                                                               | Contrast ratio | WCAG AA requirement |
| --------------------------------------------------------------------- | -------------- | ------------------- |
| `foreground` on `background`                                          | `17.74:1`      | `>= 4.5:1`          |
| `muted-foreground` on `muted`                                         | `6.88:1`       | `>= 4.5:1`          |
| `primary` on `background` and `primary-foreground` on `primary`       | `5.84:1`       | `>= 4.5:1`          |
| `secondary` on `background` and `secondary-foreground` on `secondary` | `5.18:1`       | `>= 4.5:1`          |
| `accent-foreground` on `accent`                                       | `7.41:1`       | `>= 4.5:1`          |
| `success` on `success-subtle`                                         | `7.04:1`       | `>= 4.5:1`          |
| `warning` on `warning-subtle`                                         | `6.88:1`       | `>= 4.5:1`          |
| `error` on `error-subtle`                                             | `5.91:1`       | `>= 4.5:1`          |
| `info` on `info-subtle`                                               | `7.45:1`       | `>= 4.5:1`          |
| `callout-text` on `callout-bg`                                        | `4.80:1`       | `>= 4.5:1`          |
| `ring` on `background`                                                | `5.84:1`       | `>= 3.0:1`          |
| `border-strong` on `background`                                       | `4.83:1`       | `>= 3.0:1`          |

## Typography scale

Fonts are bundled locally with `next/font/local` in [src/app/(app)/[locale]/layout.tsx](<../src/app/(app)/[locale]/layout.tsx>) so production builds do not depend on external font CDNs:

- `font-sans` and `font-heading`: Nunito variable font (`--font-nunito`), default UI and body face.
- `font-serif` and `font-lora`: Lora variable font (`--next-font-lora`), editorial titles, search results, and quotes.
- `font-noto-serif`: Noto Serif variable font (`--next-font-noto-serif`), long-form Vietnamese news articles.

| Token       | Font size           | Line height         | Typical role                       |
| ----------- | ------------------- | ------------------- | ---------------------------------- |
| `text-xxs`  | `0.625rem` (`10px`) | `1rem` (`16px`)     | Micro badges                       |
| `text-xs`   | `0.75rem` (`12px`)  | `1.125rem` (`18px`) | Timestamps, labels                 |
| `text-sm`   | `0.875rem` (`14px`) | `1.25rem` (`20px`)  | Secondary copy, buttons, footnotes |
| `text-base` | `1rem` (`16px`)     | `1.5rem` (`24px`)   | Default body copy                  |
| `text-lg`   | `1.125rem` (`18px`) | `1.75rem` (`28px`)  | Lead paragraphs, article body      |
| `text-xl`   | `1.25rem` (`20px`)  | `1.75rem` (`28px`)  | Card headings, `h3`                |
| `text-2xl`  | `1.5rem` (`24px`)   | `2rem` (`32px`)     | Section headings, `h2`             |
| `text-3xl`  | `1.875rem` (`30px`) | `2.25rem` (`36px`)  | Page headings, `h1`                |
| `text-4xl`  | `2.25rem` (`36px`)  | `2.5rem` (`40px`)   | Hero titles                        |
| `text-5xl`  | `3rem` (`48px`)     | `1.15`              | Display banners                    |

## Spacing rhythm

Spacing follows a `4px` base unit (`--spacing: 0.25rem`). Use the named rhythm tokens for consistent layout cadence:

| Token                  | Value             | Utility example | Role                                |
| ---------------------- | ----------------- | --------------- | ----------------------------------- |
| `--spacing-card-sm`    | `1rem` (`16px`)   | `p-card-sm`     | Compact card padding                |
| `--spacing-card`       | `1.5rem` (`24px`) | `p-card`        | Standard card and modal padding     |
| `--spacing-stack`      | `1rem` (`16px`)   | `gap-stack`     | Vertical gap between sibling blocks |
| `--spacing-gutter`     | `1.5rem` (`24px`) | `gap-gutter`    | Grid column gutter                  |
| `--spacing-section-sm` | `2rem` (`32px`)   | `py-section-sm` | Tight vertical section padding      |
| `--spacing-section`    | `3.5rem` (`56px`) | `py-section`    | Standard page section spacing       |
| `--spacing-section-lg` | `5rem` (`80px`)   | `py-section-lg` | Hero and major band separation      |

## Border radii

Radii derive from `--radius: 0.625rem` (`10px`):

| Utility        | Formula          | Computed size | Role                          |
| -------------- | ---------------- | ------------- | ----------------------------- |
| `rounded-xs`   | `0.4 * --radius` | `4px`         | Inline highlights, small tags |
| `rounded-sm`   | `0.6 * --radius` | `6px`         | Compact inputs, chips         |
| `rounded-md`   | `0.8 * --radius` | `8px`         | Medium controls               |
| `rounded-lg`   | `1.0 * --radius` | `10px`        | Default buttons, blockquotes  |
| `rounded-xl`   | `1.4 * --radius` | `14px`        | Cards, dropdown menus         |
| `rounded-2xl`  | `1.8 * --radius` | `18px`        | Feature panels, dialogs       |
| `rounded-3xl`  | `2.2 * --radius` | `22px`        | Editorial containers          |
| `rounded-4xl`  | `2.6 * --radius` | `26px`        | Showcase cards                |
| `rounded-pill` | `9999px`         | Full pill     | Pill buttons, badges, avatars |

## Elevation scale

Use the elevation tokens instead of arbitrary `shadow-[...]` values:

| Utility        | Role                                                  |
| -------------- | ----------------------------------------------------- |
| `shadow-xs`    | Subtle control lift on inputs and buttons             |
| `shadow-sm`    | Resting cards and flat panels                         |
| `shadow-md`    | Hovered cards and inline popovers                     |
| `shadow-lg`    | Floating dropdowns and sticky bars                    |
| `shadow-xl`    | Modal dialogs and command palettes                    |
| `shadow-inset` | Recessed quote boxes and well containers              |
| `shadow-neon`  | Warm glow reserved for featured liturgical highlights |

## Usage rules

1. Compose conditional or variant classes with `cn` from `@/utils/common`.
2. Pair every interactive element with a visible focus ring (`focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`).
3. Prefer semantic status tokens (`bg-error-subtle text-error border-error-border`) over raw color families (`bg-red-50 text-red-700`).
4. Do not import `src/app/(app)/globals.css` inside `src/app/(payload)`.

### Do and don't

```tsx
// Do: semantic surface, foreground, radius, elevation, and status tokens
<div className="rounded-xl border border-info-border bg-info-subtle p-card text-info shadow-sm">
  <p className="text-sm font-semibold">Parish schedule updated</p>
</div>

// Don't: raw hex colors, arbitrary shadows, or uncalibrated palette shades
<div className="rounded-[13px] border border-[#2f689d] bg-[#f3f7fc] p-[22px] text-[#36b3fb] shadow-[0_3px_11px_rgba(0,0,0,0.09)]">
  <p className="text-sm font-semibold">Parish schedule updated</p>
</div>
```

## Verification

Run the design token and Markdown style tests after editing `src/app/(app)/globals.css`:

```bash
node --test tests/integration/design-tokens.test.ts tests/integration/markdown-styles.test.ts
```
