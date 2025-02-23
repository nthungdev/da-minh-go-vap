import { Block } from 'payload'

const MapBlock: Block = {
  slug: 'mapBlock',
  labels: {
    singular: 'Map',
    plural: 'Maps',
  },
  fields: [
    {
      name: 'address',
      type: 'text',
      required: true,
    }
  ],
}

export default MapBlock
