import { CollectionConfig } from "payload"

const HiddenTags: CollectionConfig = {
  slug: 'hiddenTags',
  fields: [
    {
      name: 'label',
      type: 'text',
      label: 'Tên',
      required: true,
    },
    {
      name: 'tag',
      type: 'text',
      label: 'tag',
      unique: true,
      required: true,
    }
  ],
}

export default HiddenTags