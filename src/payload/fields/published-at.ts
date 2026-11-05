import type { DateField } from "payload";

export type PublishedAtFieldOptions = Partial<Omit<DateField, "type">> & {
  name?: string;
};

/**
 * Reusable published date field with standard day and time picker.
 */
export function publishedAtField(
  overrides?: PublishedAtFieldOptions,
): DateField {
  return {
    name: "publishedAt",
    type: "date",
    label: "Thời gian công bố",
    required: true,
    ...overrides,
    // Applied after the spread so a caller's `admin` merges with, not replaces, the picker default.
    admin: {
      ...overrides?.admin,
      date: {
        pickerAppearance: "dayAndTime",
        ...overrides?.admin?.date,
      },
    },
  };
}

export default publishedAtField;
