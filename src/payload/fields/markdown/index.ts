import type { CodeField } from "payload";

type MarkdownFieldOptions = Omit<CodeField, "type"> &
  Required<Pick<CodeField, "name">>;

function markdownField(override: MarkdownFieldOptions): CodeField {
  const { admin, ...restOfOverride } = override;
  return {
    type: "code",
    admin: {
      ...(admin || {}),
      custom: {
        keywordTooltipHelper: true,
        ...(admin?.custom || {}),
      },
      components: {
        ...(admin?.components || {}),
        Field: "@/payload/fields/markdown/Field",
      },
    },
    ...restOfOverride,
  };
}

export default markdownField;
