import { Block } from 'payload'

const ImageSlideshowBlock: Block = {
  slug: 'imageSlideshowBlock',
  labels: {
    singular: 'ImageSlideshowBlock',
    plural: 'ImageSlideshowBlocks',
  },
  interfaceName: 'ImageSlideShow',
  fields: [
    {
      name: 'slides',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
  ],
}

export default ImageSlideshowBlock