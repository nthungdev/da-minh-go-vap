# Application state inventory

Scope: application-owned state in `src`, identified through state hooks, timers,
query hooks, DOM plugins, routes and CMS access rules. Framework and vendor
internals are not exhaustively modeled here.

Keep binary disclosures as booleans, selections as indices, and server requests
in React Query. Use explicit unions when a workflow has mutually exclusive
phases and phase-specific data. Do not add a second owner for plugin state.

| Workflow            | Source under `src/`                                                                                                                 | States and transition owner                                                                                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Search              | `components/app-post-search-button.tsx`                                                                                             | Empty → loading → loaded/error; loaded owns results. Submit supersedes earlier requests; close/unmount invalidates them. Preline owns visibility. |
| Clipboard           | `components/copy-button.tsx`                                                                                                        | Idle → copying → copied/error; success resets after one second; failure permits retry. Pending writes are guarded and reset timers cleaned up.    |
| Paginated posts     | `components/app-post-grid-async-paginated.tsx`                                                                                      | URL or local page selects React Query state: pending, success, error, background refresh with previous data. Page size is part of cache identity. |
| Async content       | `components/app-post-{grid,list,tab-content}-async.tsx`, `components/post-group-tabs/panel.tsx`                                     | React Query owns request/cache states; render branches choose skeleton, error or data.                                                            |
| Latest posts        | `components/the-latest-posts.tsx`                                                                                                   | Query lifecycle plus selected carousel index.                                                                                                     |
| Carousels           | `components/app-carousel.tsx`, `components/app-carousel-fade.tsx`, `components/app-banners.tsx`                                     | Current slide advances on timer or navigation; banners supply durations.                                                                          |
| Rotating text       | `components/the-bible-verse.tsx`, `components/the-dominic-quote.tsx`                                                                | Interval advances selected item.                                                                                                                  |
| Tabs                | `components/app-card-tabs.tsx`, `components/post-group-tabs/index.tsx`, `components/navbar/menu-layouts/menu-layout-tabs-posts.tsx` | Selected index changes on user selection.                                                                                                         |
| Dropdown selection  | `components/post-group-tabs/select.tsx`                                                                                             | Open/closed disclosure plus selected value supplied by parent.                                                                                    |
| Navigation          | `components/the-navbar-client.tsx`                                                                                                  | React mobile `Sheet` disclosure (`mobileMenuOpen`) and Radix `Accordion` / `NavigationMenu` state.                                                |
| Lightbox            | `components/post-templates/shared/lightbox-modal.tsx`                                                                               | Closed/open; open installs keyboard handling, focus and scroll lock; cleanup restores focus.                                                      |
| Scroll control      | `components/scroll-to-top-button.tsx`                                                                                               | Hidden/visible derived from scroll events.                                                                                                        |
| Table of contents   | `components/post-table-of-contents.tsx`                                                                                             | Open/closed disclosure (`isOpen`), DOM-extracted heading items (`MutationObserver`), and one-time initial URL hash scroll.                        |
| Plugin controls     | `components/app-accordion.tsx`, `components/app-select-basic.tsx`, `components/app-post-tab-grid-async.tsx`                         | Preline owns expanded, selected and active DOM states.                                                                                            |
| Plugin bootstrap    | `components/preline-script.tsx`                                                                                                     | Route change schedules idle/timed initialization; cleanup cancels scheduling.                                                                     |
| Live preview        | `components/refresh-route-on-save.tsx`                                                                                              | Outside iframe disabled; iframe loads module then enables refresh callbacks.                                                                      |
| Markdown editing    | `payload/fields/markdown/MarkdownEditor.tsx`                                                                                        | Local input synchronized with CMS field value.                                                                                                    |
| Publication/access  | `payload/utils/access-control.ts`                                                                                                   | Public eligibility depends on publication time and content presence/mode; authenticated admin access bypasses public filtering.                   |
| Site authentication | `middleware.ts`, `utils/auth.ts`, `app/(app)/[locale]/auth/basic/page.tsx`                                                          | Request credentials and auth cookie govern challenge/redirect paths; middleware enforcement flag is currently false.                              |
| Analytics bootstrap | `instrumentation-client.ts`                                                                                                         | Deferred initialization.                                                                                                                          |

## Remaining review targets

- Carousel indices use duration lengths; shrinking data or mismatched durations
  need explicit product behavior and regression coverage before consolidation.
- Search overlay acquisition depends on Preline initialization; test opening
  before idle initialization and reopening during requests in a real browser.
- Audit all query keys for every request argument (including limits), and test
  filter changes while previous data remains visible.
- Test overlapping dialogs before changing lightbox scroll-lock ownership.
- Live-preview and plugin dynamic imports need failure/retry decisions.

## Regression scenarios

Search: submit with Enter without navigation; empty input; no results; rejection;
submit A then B and resolve A last; close during request; reopen.

Clipboard: denied permission; rapid repeated clicks; success timeout; unmount
while writing or waiting for reset.

Pagination: cold load; initial failure; next page with cached previous data;
back/forward navigation; same filters with different page sizes.
