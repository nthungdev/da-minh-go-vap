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
      },
    },
    ...override,
  };
}

export default markdownField;
