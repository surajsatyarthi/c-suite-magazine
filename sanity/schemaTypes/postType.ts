import { DocumentTextIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { validateTags } from '../lib/tagValidation'
import { TagAutocompleteInput } from '../components/TagAutocompleteInput'

export const postType = defineType({
  name: 'post',
  title: 'Article',
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
      name: 'isHidden',
      type: 'boolean',
      title: 'Hide Article',
      description: 'If enabled, this article is hidden from the site but remains in the Studio.',
      group: 'meta',
      initialValue: false,
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
      description: 'Writer of record for this article',
      to: { type: 'writer' },
      group: 'meta',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mainImage',
      type: 'image',
      title: 'Featured Image',
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
        defineField({
          name: 'caption',
          type: 'string',
          title: 'Caption',
        }),
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
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'tags',
      type: 'array',
      title: 'Tags',
      description: 'Short topical labels displayed on article cards. Use existing tags when possible. Min 3 characters, no stopwords.',
      of: [
        defineArrayMember({ 
          type: 'string',
          components: {
            input: TagAutocompleteInput
          }
        })
      ],
      group: 'meta',
      validation: (Rule) => Rule.required().min(3).max(3).custom((tags) => {
        return validateTags((tags as string[]) || []);
      }),
    }),
    defineField({
      name: 'contentPillar',
      type: 'string',
      title: 'Content Pillar',
      group: 'meta',
    }),
    // Removed keyPoints (was for placeholder variant)
    defineField({
      name: 'articleVariant',
      type: 'string',
      title: 'Article Variant',
      description: 'Choose the rendering type',
      options: {
        list: [
          { title: 'Interview', value: 'interview' },
          { title: 'Opinion', value: 'opinion' },
        ],
        layout: 'radio'
      },
      group: 'meta',
      initialValue: 'opinion',
    }),
    defineField({
      name: 'isFeatured',
      type: 'boolean',
      title: 'Featured Article',
      description: 'Display this article prominently on the homepage',
      initialValue: false,
      group: 'meta',
    }),
    defineField({
      name: 'readTime',
      type: 'number',
      title: 'Read Time (minutes)',
      description: 'Estimated reading time in minutes',
      group: 'meta',
    }),
    defineField({
      name: 'articleType',
      type: 'string',
      title: 'Article Type',
      description: 'System field. Enter "spotlight" to prevent auto-image generation. Leave blank for standard articles.',
      group: 'meta',
    }),
    defineField({
      name: 'wordCount',
      type: 'number',
      title: 'Word Count',
      description: 'Total words in the article (from source JSON)',
      group: 'meta',
      readOnly: true,
    }),
    defineField({
      name: 'views',
      type: 'number',
      title: 'Viewership Count',
      description: 'Total views provided by source JSON',
      group: 'meta',
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      title: 'Published At',
      description: 'Publish date for scheduling and sorting',
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
              {
                title: 'URL',
                name: 'link',
                type: 'object',
                fields: [{ title: 'URL', name: 'href', type: 'url' }],
              },
            ],
          },
        }),
        defineArrayMember({ type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', type: 'string', title: 'Alternative text' }] }),
        defineArrayMember({ type: 'video' }),
        defineArrayMember({ type: 'table' }),
        defineArrayMember({ type: 'carousel' }),
        defineArrayMember({ type: 'cta' }),
        defineArrayMember({ type: 'partnerQuotes' }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'seo',
      type: 'object',
      title: 'SEO Settings',
      group: 'seo',
      fields: [
        defineField({
          name: 'metaTitle',
          type: 'string',
          title: 'Meta Title',
          description: 'Override the default title for SEO',
        }),
        defineField({
          name: 'metaDescription',
          type: 'text',
          title: 'Meta Description',
          rows: 3,
          validation: (Rule) => Rule.max(160),
        }),
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
      name: 'category',
      type: 'reference',
      title: 'Primary Category',
      description: 'Single primary category for display',
      to: { type: 'category' },
      group: 'meta',
    }),
    defineField({
      name: 'content',
      type: 'array',
      title: 'Legacy Content',
      description: 'Legacy field for imported content',
      of: [defineArrayMember({ type: 'block' })],
      group: 'content',
      hidden: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      writer: 'writer.name',
      media: 'mainImage',
      views: 'views',
      readTime: 'readTime',
    },
    prepare(selection) {
      const { writer, views, readTime } = selection as any
      const v = typeof views === 'number' && views > 0 ? `${(views / 1_000_000).toFixed(1)}M views` : '—'
      const rt = typeof readTime === 'number' && readTime > 0 ? `${readTime} min` : ''
      return {
        ...selection,
        subtitle: `${writer ? `by ${writer}` : 'No writer'}${rt ? ` • ${rt}` : ''} • ${v}`
      }
    },
  },
})
