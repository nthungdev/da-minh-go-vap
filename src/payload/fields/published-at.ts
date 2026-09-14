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
    admin: {
      date: {
        pickerAppearance: "dayAndTime",
      },
      ...overrides?.admin,
    },
    ...overrides,
  };
}

export default publishedAtField;
