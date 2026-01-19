import { defineField, defineType } from 'sanity'

export const executiveInFocusConfigType = defineType({
  name: 'executiveInFocusConfig',
  title: '👔 Executive in Focus Config',
  type: 'document',
  description: '👔 Select which article to feature as the principal "Executive in Focus" hero on the homepage.',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Executive in Focus',
      hidden: true,
    }),
    defineField({
      name: 'featuredArticle',
      title: '👤 Featured Executive Article',
      type: 'reference',
      to: [{ type: 'post' }, { type: 'csa' }],
      description: '🔍 Search and select the article to feature. The article\'s title, image, and link will be used automatically.',
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: 'customPosition',
      title: '💼 Custom Position (Optional)',
      type: 'string',
      description: 'e.g. "CEO, Xero". Leave blank to use a default placeholder.',
    }),
    defineField({
      name: 'customDescription',
      title: '📝 Custom Description (Optional)',
      type: 'text',
      rows: 3,
      description: 'Override the article description if you want custom text. Leave blank to use article data.',
    }),
  ],
  preview: {
    select: {
      articleTitle: 'featuredArticle.title',
    },
    prepare({ articleTitle }: any) {
      return {
        title: '👔 Executive in Focus',
        subtitle: articleTitle || 'No article selected',
      }
    },
  },
})
