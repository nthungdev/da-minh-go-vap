import type { GroupField, TextField } from "payload";

type TextFieldSingle = Extract<TextField, { hasMany?: false }>;

export interface SourceFieldOptions {
  nameOverrides?: Partial<Omit<TextFieldSingle, "type">>;
  urlOverrides?: Partial<Omit<TextFieldSingle, "type">>;
}

/**
 * Reusable source reference fields (source name + URL).
 */
export function sourceFields(
  options?: SourceFieldOptions,
): [TextFieldSingle, TextFieldSingle] {
  const nameField: TextFieldSingle = {
    name: "name",
    type: "text",
    label: "Tên nguồn",
    ...(options?.nameOverrides as object),
    admin: {
      placeholder: "Ví dụ: Latter Day Kids, Vatican News",
      ...options?.nameOverrides?.admin,
    },
  };

  const urlField: TextFieldSingle = {
    name: "url",
    type: "text",
    label: "Đường dẫn nguồn",
    ...(options?.urlOverrides as object),
    admin: {
      placeholder: "https://...",
      ...options?.urlOverrides?.admin,
    },
  };

  return [nameField, urlField];
}

export type SourceGroupFieldOptions = Partial<
  Omit<GroupField, "type" | "fields">
> & {
  fieldOptions?: SourceFieldOptions;
};

/**
 * Reusable source group field.
 */
export function sourceGroupField(
  options?: SourceGroupFieldOptions,
): GroupField {
  const { fieldOptions, ...groupOverrides } = options || {};

  return {
    name: "source",
    type: "group",
    label: "Nguồn gốc bài viết",
    ...groupOverrides,
    fields: sourceFields(fieldOptions),
  };
}
