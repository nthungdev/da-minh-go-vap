import { defaultSchema } from "rehype-sanitize";

/**
 * Sanitization schema for AppMarkdown.
 *
 * `remark-rehype` already applies the `user-content-` clobber prefix to footnote
 * IDs, so `clobberPrefix` is cleared here to avoid double-prefixing `id`
 * attributes (`user-content-user-content-fn-1`) out of sync with `href`.
 */
export const markdownSanitizeSchema = {
  ...defaultSchema,
  clobberPrefix: "",
  tagNames: [
    ...new Set([
      ...(defaultSchema.tagNames ?? []),
      "keyword",
      "section",
      "sup",
      "ol",
      "li",
      "a",
      "h2",
    ]),
  ],
  attributes: {
    ...defaultSchema.attributes,
    i: [...(defaultSchema.attributes?.i ?? []), "className"],
    section: [
      ...(defaultSchema.attributes?.section ?? []),
      "dataFootnotes",
      "className",
    ],
    h2: [...(defaultSchema.attributes?.h2 ?? []), "id", "className"],
    ol: [...(defaultSchema.attributes?.ol ?? []), "className"],
    li: [...(defaultSchema.attributes?.li ?? []), "id", "className"],
    sup: [...(defaultSchema.attributes?.sup ?? []), "className"],
    a: [
      ...(defaultSchema.attributes?.a ?? []),
      "href",
      "id",
      "className",
      "dataFootnoteRef",
      "dataFootnoteBackref",
      "ariaDescribedBy",
      "ariaLabel",
    ],
    keyword: [
      "dataTitle",
      "dataDescription",
      "dataImage",
      "dataImageUrl",
      "dataHref",
      "title",
      "description",
      "image",
      "href",
    ],
  },
};
