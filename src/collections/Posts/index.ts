import markdownField from '@/fields/markdown'
import { validateSlug } from '@/utils/slug'
import type { CollectionConfig } from 'payload'

const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      required: true,
      hasMany: false,
      validate: validateSlug,
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Thời gian công bố',
      required: true,
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'hiddenTags',
      type: 'relationship',
      relationTo: 'hiddenTags',
      hasMany: true,
      defaultValue: [],
      required: true,
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'videos',
      type: 'array',
      defaultValue: [],
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Tiêu đề',
          required: true,
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Youtube', value: 'youtube' },
            { label: 'Facebook', value: 'facebook' },
          ],
        },
        {
          name: 'url',
          type: 'text',
          label: 'URL',
          required: true,
        },
      ]
    },
    {
      ...markdownField('body'),
      required: true,
    },
  ],
}

export default Posts
