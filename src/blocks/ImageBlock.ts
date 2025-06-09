import { Block } from 'payload'

const ImageBlock: Block = {
  slug: 'imageBlock',
  labels: {
    singular: 'Image',
    plural: 'Images',
  },
  interfaceName: 'ImageBlock',
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
  ],
}

export default ImageBlock
