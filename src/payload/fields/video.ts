import type { Field, GroupField, SelectField, TextField } from "payload";

type TextFieldSingle = Extract<TextField, { hasMany?: false }>;
type SelectFieldSingle = Extract<SelectField, { hasMany?: false }>;

export interface VideoFieldOptions {
  selectOverrides?: Partial<Omit<SelectFieldSingle, "type">>;
  videoIdOverrides?: Partial<Omit<TextFieldSingle, "type">>;
}

/**
 * Reusable video source fields (video type select + videoId text field).
 */
export function videoSourceFields(
  options?: VideoFieldOptions,
): [SelectFieldSingle, TextFieldSingle] {
  const typeField: SelectFieldSingle = {
    name: "type",
    type: "select",
    label: "Nền tảng video",
    required: true,
    defaultValue: "youtube",
    options: [
      { label: "YouTube (Shorts / Video)", value: "youtube" },
      { label: "Facebook Watch", value: "facebook" },
    ],
    ...(options?.selectOverrides as object),
  };

  const videoIdField: TextFieldSingle = {
    name: "videoId",
    type: "text",
    label: "Video ID",
    required: true,
    ...(options?.videoIdOverrides as object),
    admin: {
      placeholder: "Ví dụ: oBh8b7tH9BY",
      ...options?.videoIdOverrides?.admin,
    },
  };

  return [typeField, videoIdField];
}

export type VideoGroupFieldOptions = Partial<
  Omit<GroupField, "type" | "fields">
> & {
  fieldOptions?: VideoFieldOptions;
  extraFields?: Field[];
};

/**
 * Reusable video group field containing video platform type and video ID.
 */
export function videoGroupField(options?: VideoGroupFieldOptions): GroupField {
  const { fieldOptions, extraFields = [], ...groupOverrides } = options || {};

  return {
    name: "video",
    type: "group",
    label: "Video",
    ...groupOverrides,
    fields: [...videoSourceFields(fieldOptions), ...extraFields],
  };
}

export { videoSourceFields as videoFields };
