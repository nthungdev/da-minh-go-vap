import type { GroupField, TextField } from "payload";

type TextFieldSingle = Extract<TextField, { hasMany?: false }>;

export interface ScriptureFieldOptions {
  required?: boolean;
  localized?: boolean;
  verseOverrides?: Partial<Omit<TextFieldSingle, "type">>;
  referenceOverrides?: Partial<Omit<TextFieldSingle, "type">>;
}

/**
 * Reusable scripture verse and biblical reference fields.
 */
export function scriptureFields(
  options?: ScriptureFieldOptions,
): [TextFieldSingle, TextFieldSingle] {
  const {
    required = false,
    localized = true,
    verseOverrides,
    referenceOverrides,
  } = options || {};

  const verseField: TextFieldSingle = {
    name: "verse",
    type: "text",
    label: "Câu Lời Chúa",
    required,
    localized,
    ...(verseOverrides as object),
    admin: {
      placeholder: "Ví dụ: “Thầy là đường, là sự thật và là sự sống.”",
      ...verseOverrides?.admin,
    },
  };

  const referenceField: TextFieldSingle = {
    name: "reference",
    type: "text",
    label: "Đoạn Kinh Thánh",
    required,
    localized,
    ...(referenceOverrides as object),
    admin: {
      placeholder: "Ví dụ: Ga 14,6",
      ...referenceOverrides?.admin,
    },
  };

  return [verseField, referenceField];
}

export type ScriptureGroupFieldOptions = Partial<
  Omit<GroupField, "type" | "fields">
> & {
  name?: string;
  fieldOptions?: ScriptureFieldOptions;
};

/**
 * Reusable scripture group field (e.g. for scriptureAnchor or quote box).
 */
export function scriptureGroupField(
  options?: ScriptureGroupFieldOptions,
): GroupField {
  const {
    fieldOptions,
    name = "scriptureAnchor",
    label = "Câu Lời Chúa đính kèm",
    ...groupOverrides
  } = options || {};

  return {
    name,
    type: "group",
    label,
    ...groupOverrides,
    fields: scriptureFields(fieldOptions),
  };
}
