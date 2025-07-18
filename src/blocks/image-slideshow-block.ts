import { Block } from "payload";

const ImageSlideshowBlock: Block = {
  slug: "imageSlideshowBlock",
  labels: {
    singular: "Image Slideshow Block",
    plural: "Image Slideshow Blocks",
  },
  interfaceName: "ImageSlideShowBlock",
  fields: [
    {
      name: "images",
      type: "upload",
      relationTo: "media",
      required: true,
      unique: false,
      hasMany: true,
    },
  ],
};

export default ImageSlideshowBlock;
