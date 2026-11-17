import type { TextField } from "payload";

type TextFieldSingle = Extract<TextField, { hasMany?: false }>;

export type AuthorFieldOptions = Partial<Omit<TextFieldSingle, "type">>;

/**
 * Reusable author / attribution field.
 */
export function authorField(overrides?: AuthorFieldOptions): TextFieldSingle {
  return {
    name: "author",
    type: "text",
    label: "Tác giả",
    localized: true,
    ...(overrides as object),
    admin: {
      placeholder: "Ví dụ: Ban Biên tập / Tên tác giả",
      ...overrides?.admin,
    },
  };
}

export default authorField;
