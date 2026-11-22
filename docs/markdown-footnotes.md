# Markdown Footnotes

Add Wikipedia-style footnote references and definitions to Markdown fields (plain Markdown posts, post templates, or content blocks). Footnotes render at the bottom of the article with bidirectional jump navigation, sticky-navbar clearance, and `:target` highlighting.

## Insert via the Admin Helper

1. Open any Markdown field in Payload CMS.
2. Place the cursor where the reference marker should appear.
3. Click the **Chèn chú thích** button located directly above the Markdown editor.
4. The editor inserts `[^n]` at the cursor with the next sequential number (e.g. `[^1]`, `[^2]`) and appends the matching definition template `[^n]: ` to the bottom of the content.
5. Write or paste the footnote text immediately following `[^n]: `.

## Manual Syntax

You can also write standard GitHub Flavored Markdown (GFM) footnote syntax manually:

```markdown
Here is a sentence that cites a historical document[^1]. Another point requires further theological clarification[^2].

[^1]: Vatican II, _Lumen Gentium_, paragraph 16.

[^2]: St. Thomas Aquinas, _Summa Theologiae_, I-II, q. 94, a. 2.
```

### Multi-Line & Indented Continuations

Footnote definitions can span multiple paragraphs or lines. Indent continuation lines with 4 spaces or a tab:

```markdown
[^1]: First paragraph of the footnote.

    Second paragraph belonging to the same footnote, indented by 4 spaces.
```

The Markdown preprocessor preserves leading indentation on footnote definitions and continuations so they do not get converted into non-breaking spaces or detached code blocks.

## Public Page Rendering & Behavior

- **Localized heading**: Rendered footnote sections display a visible divider and localized section heading (`Chú thích` in Vietnamese, `Footnotes` in English).
- **Bidirectional jump navigation**: Clicking an inline `[^1]` reference jumps to the corresponding definition at the bottom; clicking the `↩` backlink returns to the inline marker.
- **Sticky navbar clearance**: Footnote reference links and definition items use `scroll-mt-24` so jump navigation targets are not obscured by the fixed header.
- **Target highlighting**: Jumped-to footnote targets receive `:target` styling (`bg-primary-50 ring-1 ring-primary-300`) to highlight the active reference.

For interactive hover/focus cards in Markdown content, see [docs/keyword-tooltip.md](keyword-tooltip.md).

## Verification

Run the footnote tests:

```bash
node --test tests/integration/markdown-footnotes.test.ts
```
