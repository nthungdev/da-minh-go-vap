import { Block } from 'payload'

const BannerSlideshowBlock: Block = {
  slug: 'bannerSlideshowBlock',
  labels: {
    singular: 'Banner Slideshow Block',
    plural: 'Banner Slideshow Blocks',
  },
  interfaceName: 'BannerSlideShowBlock',
  fields: [
    {
      name: 'Banners',
      type: 'upload',
      relationTo: 'media',
      required: true,
      unique: false,
      hasMany: true,
    },
  ],
}

export default BannerSlideshowBlock
