import type { CodeField } from "payload";

type MarkdownFieldOptions = Omit<CodeField, "type" | "admin"> &
  Required<Pick<CodeField, "name">>;

function markdownField(override: MarkdownFieldOptions): CodeField {
  return {
    type: "code",
    admin: {
      components: {
        Field: "@/payload/fields/markdown/Field",
      },
    },
    ...override,
  };
}

export default markdownField;
