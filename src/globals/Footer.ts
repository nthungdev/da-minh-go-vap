import { GlobalConfig } from 'payload'

const Footer: GlobalConfig = {
  slug: 'footer',
  fields: [
    {
      name: 'topFooterDecorativeGraphic',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'contact',
      type: 'group',
      fields: [
        {
          name: 'name',
          type: 'text',
        },
        {
          name: 'address',
          type: 'text',
        },
        {
          name: 'phone',
          type: 'text',
        },
        {
          name: 'email',
          type: 'text',
        },
        {
          name: 'marketingEmail',
          type: 'text',
        },
      ],
    },
    {
      name: 'externalLinks',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}

export default Footer
