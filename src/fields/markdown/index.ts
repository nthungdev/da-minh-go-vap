import type { CodeField } from "payload";

function markdownField(
  name: string,
  override: Partial<CodeField> = {},
): CodeField {
  return {
    type: "code",
    name,
    admin: {
      components: {
        Field: "@/fields/markdown/Field",
        Label: "@/fields/markdown/Label",
      },
    },
    ...override,
  };
}

export default markdownField;
