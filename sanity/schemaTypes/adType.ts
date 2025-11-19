import {BulbOutlineIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const adType = defineType({
  name: 'advertisement',
  title: 'Advertisement',
  type: 'document',
  icon: BulbOutlineIcon,
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'Ad Name',
      description: 'Internal name to identify this ad (not shown to visitors)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Ad Image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          validation: (Rule) => Rule.required(),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'targetUrl',
      type: 'url',
      title: 'Target URL',
      description: 'Where should this ad link to?',
      validation: (Rule) => Rule.required().uri({
        scheme: ['http', 'https'],
      }),
    }),
    defineField({
      name: 'placement',
      type: 'string',
      title: 'Ad Placement',
      description: 'Where should this ad appear?',
      options: {
        list: [
          {title: 'Article Sidebar Large (300x600)', value: 'article-sidebar-large'},
          {title: 'In-Article (728x90 Leaderboard)', value: 'in-article'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'dimensions',
      type: 'object',
      title: 'Ad Dimensions',
      description: 'Recommended size for this placement',
      fields: [
        defineField({
          name: 'width',
          type: 'number',
          title: 'Width (px)',
          validation: (Rule) => Rule.required().min(1),
        }),
        defineField({
          name: 'height',
          type: 'number',
          title: 'Height (px)',
          validation: (Rule) => Rule.required().min(1),
        }),
      ],
    }),
    defineField({
      name: 'isActive',
      type: 'boolean',
      title: 'Active',
      description: 'Turn this ad on or off',
      initialValue: true,
    }),
    defineField({
      name: 'startDate',
      type: 'datetime',
      title: 'Start Date',
      description: 'When should this ad start showing? (Optional)',
    }),
    defineField({
      name: 'endDate',
      type: 'datetime',
      title: 'End Date',
      description: 'When should this ad stop showing? (Optional)',
    }),
    defineField({
      name: 'priority',
      type: 'number',
      title: 'Priority',
      description: 'Higher number = higher priority (for rotation)',
      initialValue: 1,
      validation: (Rule) => Rule.min(1).max(10),
    }),
    defineField({
      name: 'openInNewTab',
      type: 'boolean',
      title: 'Open in New Tab',
      description: 'Should the ad link open in a new browser tab?',
      initialValue: true,
    }),
    defineField({
      name: 'notes',
      type: 'text',
      title: 'Internal Notes',
      description: 'Notes about this ad campaign, client info, etc.',
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      placement: 'placement',
      isActive: 'isActive',
      media: 'image',
    },
    prepare(selection) {
      const {title, placement, isActive} = selection
      const status = isActive ? '🟢' : '🔴'
      return {
        ...selection,
        subtitle: `${status} ${placement || 'No placement'}`,
      }
    },
  },
})
