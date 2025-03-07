import { Block } from 'payload'

const PostGroupBlock: Block = {
  slug: 'postGroupBlock',
  labels: {
    singular: 'Post Group',
    plural: 'Post Groups',
  },
  interfaceName: 'PostGroupBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'hiddenTags',
      type: 'relationship',
      relationTo: 'hiddenTags',
      hasMany: true,
      required: true,
      unique: true,
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 4,
    },
    {
      name: 'viewMoreButton',
      type: 'group',
      fields: [
        {
          name: 'enableViewMoreButton',
          type: 'checkbox',
          defaultValue: false,
          required: true,
        },
        // {
        //   name: 'relativeUrl',
        //   type: 'relationship',
        //   relationTo: 'posts',
        //   hasMany: false,
        // },
      ],
    },
  ],
}

export default PostGroupBlock
