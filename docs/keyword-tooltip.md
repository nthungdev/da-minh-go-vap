# Keyword Tooltips

Wrap any phrase in a Markdown field (plain Markdown posts, post templates, or content blocks) with `<keyword>` to show a hover/focus tooltip card on the public page.

## Insert via the Admin Helper

1. Open any Markdown field in Payload CMS.
2. Select a phrase (or place the cursor) and click **Chèn chú giải** in the **Chú giải từ khóa** banner.
3. Enter **Tiêu đề** and **Mô tả** (optionally **URL ảnh** and **Đường dẫn "Xem thêm"**).
4. Click **Chèn vào nội dung** to insert the `<keyword>` tag. Press **Hủy** or `Esc` to cancel.

## Manual Syntax

```html
<keyword
  data-title="Sunday Mass"
  data-description="Weekly liturgical celebration of the Resurrection."
  data-image="https://example.org/media/mass.jpg"
  data-href="/related-post"
>
  Sunday Mass
</keyword>
```

| Attribute          | Required | Purpose                                                            |
| ------------------ | -------- | ------------------------------------------------------------------ |
| `data-title`       | Yes      | Tooltip heading.                                                   |
| `data-description` | Yes      | Short definition or explanation.                                   |
| `data-image`       | No       | Payload Media URL (auto-optimized on render).                      |
| `data-href`        | No       | Target path/URL; displays a **Xem thêm** link in the tooltip card. |

- Legacy attributes (`title`, `description`, `image`, `data-image-url`, `href`) are still supported for existing content; use `data-*` for new markup.
- The Markdown editor shows raw source only—save and view the published page to verify the interactive tooltip.
- To hide the helper banner on a specific `markdownField()`, pass `admin: { custom: { keywordTooltipHelper: false } }`.
- For adding Wikipedia-style footnote links and definitions, see [docs/markdown-footnotes.md](markdown-footnotes.md).
