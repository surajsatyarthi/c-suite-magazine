import { UserIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const writerType = defineType({
  name: 'writer',
  title: 'Writer',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'Full Name',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'position',
      type: 'string',
      title: 'Position/Title',
      description: 'e.g., Executive Editor, Contributing Writer',
    }),
    defineField({
      name: 'writerType',
      type: 'string',
      title: 'Writer Type',
      description: 'Classify the writer (Staff, Guest, Contributor)',
      options: {
        list: [
          { title: 'Staff', value: 'staff' },
          { title: 'Guest Author', value: 'guest' },
          { title: 'Contributor', value: 'contributor' },
          { title: 'Featured Client (No Profile Page)', value: 'client' },
        ],
        layout: 'radio',
      },
      initialValue: 'staff',
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Profile Photo',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'bio',
      type: 'array',
      title: 'Biography',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [],
        }),
      ],
    }),
    defineField({
      name: 'social',
      type: 'object',
      title: 'Social Media',
      fields: [
        defineField({
          name: 'email',
          type: 'string',
          title: 'Email Address',
          description: 'Contact email for the writer (optional)',
          validation: (Rule) => Rule.email(),
        }),
        defineField({
          name: 'showEmail',
          type: 'boolean',
          title: 'Show Email Publicly?',
          description: 'If enabled, the email will be displayed on the writer profile page',
          initialValue: false,
        }),
        defineField({
          name: 'twitter',
          type: 'url',
          title: 'Twitter/X URL',
        }),
        defineField({
          name: 'linkedin',
          type: 'url',
          title: 'LinkedIn URL',
        }),
        defineField({
          name: 'website',
          type: 'url',
          title: 'Personal Website',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'position',
      media: 'image',
    },
  },
})
