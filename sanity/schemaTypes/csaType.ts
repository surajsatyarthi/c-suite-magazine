import { DocumentTextIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const csaType = defineType({
  name: 'csa',
  title: 'Company Sponsored Article (CSA)',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'meta', title: 'Metadata' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      title: 'Excerpt',
      description: 'Short description for article cards and SEO',
      rows: 3,
      group: 'content',
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'writer',
      type: 'reference',
      title: 'Writer',
      to: { type: 'writer' },
      group: 'meta',
    }),
    defineField({
      name: 'mainImage',
      type: 'image',
      title: 'Featured Image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', type: 'string', title: 'Alternative text' }),
        defineField({ name: 'caption', type: 'string', title: 'Caption' }),
      ],
      group: 'meta',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'spotlightImage',
      type: 'image',
      title: 'Homepage Card Image',
      description: 'Use a 2:3 vertical crop for the homepage spotlight card. If empty, mainImage will be used.',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', type: 'string', title: 'Alternative text' }),
        defineField({ name: 'caption', type: 'string', title: 'Caption' }),
      ],
      group: 'meta',
    }),
    defineField({
      name: 'categories',
      type: 'array',
      title: 'Categories',
      of: [defineArrayMember({ type: 'reference', to: { type: 'category' } })],
      group: 'meta',
      initialValue: [],
    }),
    defineField({
      name: 'tags',
      type: 'array',
      title: 'Tags',
      of: [defineArrayMember({ type: 'string' })],
      group: 'meta',
    }),
    defineField({
      name: 'body',
      type: 'array',
      title: 'Article Content',
      description: 'Rich text blocks and inline images',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H1', value: 'h1' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'Quote', value: 'blockquote' },
          ],
          lists: [{ title: 'Bullet', value: 'bullet' }],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Underline', value: 'underline' },
            ],
            annotations: [
              { title: 'URL', name: 'link', type: 'object', fields: [{ title: 'URL', name: 'href', type: 'url' }] },
            ],
          },
        }),
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'Alternative text' },
            { name: 'href', type: 'url', title: 'Link URL', description: 'Optional: Make this image clickable (e.g., for ads)' },
            { name: 'caption', type: 'string', title: 'Caption', description: 'Optional: Text to display below the image' },
            { name: 'triggersPopup', type: 'boolean', title: 'Triggers Popup', description: 'If checked, this image will trigger the popup ad when viewed.' },
          ],
        }),

        defineArrayMember({ type: 'video' }),
        defineArrayMember({ type: 'table' }),
        defineArrayMember({ type: 'carousel' }),
        defineArrayMember({ type: 'cta' }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'seo',
      type: 'object',
      title: 'SEO Settings',
      group: 'seo',
      fields: [
        defineField({ name: 'metaTitle', type: 'string', title: 'Meta Title' }),
        defineField({ name: 'metaDescription', type: 'text', title: 'Meta Description', rows: 3 }),
      ],
    }),
    defineField({
      name: 'popupAd',
      type: 'object',
      title: 'Popup Ad',
      group: 'meta',
      fields: [
        defineField({ name: 'image', type: 'image', title: 'Image' }),
        defineField({ name: 'targetUrl', type: 'url', title: 'Target URL' }),
        defineField({ name: 'alt', type: 'string', title: 'Alt Text' }),
      ],
    }),
    defineField({
      name: 'legacySlug',
      type: 'string',
      title: 'Legacy Slug',
      description: 'Previous slug for redirect purposes (auto-populated during slug updates)',
      group: 'meta',
      readOnly: true,
    }),
    defineField({
      name: 'readTime',
      type: 'number',
      title: 'Read Time (minutes)',
      description: 'Estimated reading time in minutes',
      group: 'meta',
      validation: (Rule) => Rule.min(1).max(60),
    }),
    defineField({
      name: 'category',
      type: 'reference',
      title: 'Display Category',
      description: 'Primary category for public display. CSA articles are internally company-sponsored but publicly shown under this category (usually CXO Interview).',
      to: { type: 'category' },
      group: 'meta',
    }),
  ],
  preview: {
    select: { title: 'title', media: 'mainImage', writer: 'writer.name' },
    prepare(selection) {
      return { ...selection, subtitle: selection?.writer ? `CSA • by ${selection.writer}` : 'CSA' }
    },
  },
})
