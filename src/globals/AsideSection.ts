import { GlobalConfig } from "payload";

const AsideSection: GlobalConfig = {
  slug: 'asideSection',
  fields: [
    {
      name: 'slideshow',
      type: 'group',
      fields: [
        {
          name: 'enable',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'slides',
          type: 'upload',
          relationTo: 'media',
        },
      ]
    },
    {
      name: 'postGroups',
      type: 'group',
      fields: [
        {
          name: 'enable',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'groups',
          type: 'array',
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Tiêu đề',
              required: true,
            },
            {
              name: 'limit',
              type: 'number',
              min: 1,
              max: 100,
              defaultValue: 5,
            },
            {
              name: 'hiddenTags',
              type: 'relationship',
              relationTo: 'hiddenTags',
              hasMany: true,
            }
          ]
        }
      ]
    },
    {
      name: 'curatedPosts',
      type: 'group',
      fields: [
        {
          name: 'enable',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'posts',
          type: 'array',
          fields: [
            {
              name: 'post',
              type: 'relationship',
              relationTo: 'posts',
            }
          ]
        }
      ]
    },
    {
      name: 'links',
      type: 'group',
      fields: [
        {
          name: 'enable',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'links',
          type: 'array',
          fields: [
            {
              name: 'url',
              type: 'text',
              required: true,
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
            }
          ]
        }
      ]
    }
  ],
}

export default AsideSection