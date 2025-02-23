import { Block } from 'payload'

const MapBlock: Block = {
  slug: 'mapBlock',
  labels: {
    singular: 'Map',
    plural: 'Maps',
  },
  interfaceName: 'MapBlock',
  fields: [
    {
      name: 'address',
      type: 'text',
      required: true,
    }
  ],
}

export default MapBlock
