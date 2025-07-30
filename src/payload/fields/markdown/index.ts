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
        Field: "@/payload/fields/markdown/Field",
        Label: "@/payload/fields/markdown/Label",
      },
    },
    ...override,
  };
}

export default markdownField;
