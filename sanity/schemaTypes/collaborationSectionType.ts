import { defineType, defineField } from 'sanity'

export const collaborationSectionType = defineType({
  name: 'collaborationSection',
  title: 'In Collaboration With Section',
  type: 'object',
  fields: [
    defineField({
      name: 'preTitle',
      title: 'Pre-Title (e.g., IN COLLABORATION WITH)',
      type: 'string',
      initialValue: 'IN COLLABORATION WITH'
    }),
    defineField({
      name: 'title',
      title: 'Title (e.g., Colliers India)',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'linkText',
      title: 'Link Text',
      type: 'string',
      initialValue: 'Read More'
    }),
    defineField({
      name: 'linkUrl',
      title: 'Link URL',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'Side Image',
      type: 'image',
      options: { hotspot: true }
    }),
    defineField({
      name: 'quoteText',
      title: 'Quote Text',
      type: 'text',
    }),
    defineField({
      name: 'quoteAuthor',
      title: 'Quote Author',
      type: 'string',
    }),
    defineField({
      name: 'quoteRole',
      title: 'Quote Author Role',
      type: 'string',
    }),
  ],
})
