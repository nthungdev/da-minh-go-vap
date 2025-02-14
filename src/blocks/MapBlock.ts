import { Block } from 'payload'

const MapBlock: Block = {
  slug: 'mapBlock',
  labels: {
    singular: 'Text',
    plural: 'Texts',
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
