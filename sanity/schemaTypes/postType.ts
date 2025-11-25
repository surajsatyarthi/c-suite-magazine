import {DocumentTextIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

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
        // Ensure uniqueness across dataset
        isUnique: (value, context) => context?.defaultIsUnique?.(value, context) ?? true,
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
      validation: (Rule) => Rule.max(200).custom((value) => {
        const raw = String(value || '')
        const cleaned = raw
          .replace(/!\[[^\]]*\]\([^\)]*\)/g, '')
          .replace(/```[\s\S]*?```/g, '')
          .replace(/`[^`]*`/g, '')
          .replace(/\*\*|__|\*|_/g, '')
          .replace(/^\s*#{1,6}\s+/gm, '')
          .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
          .replace(/\s+/g, ' ')
          .trim()
        // Block obvious contamination: HTML tags or spun tokens
        if (/<[a-z][\s\S]*>/i.test(raw)) return 'Remove HTML — excerpt must be plain text.'
        if (/\bspunarticle\b|\bspun\b/i.test(raw)) return 'Remove invalid tokens (spun/spunarticle).'
        const looksLikeImagePath = /\.(jpg|jpeg|png|gif|webp|svg)\b/i.test(raw) || /^!\[[^\]]*\]\([^\)]*\)$/.test(raw.trim())
        if (!cleaned) return 'Excerpt cannot be empty after sanitation.'
        if (looksLikeImagePath) return 'Excerpt must be human-readable text, not image markdown or filenames.'
        return true
      }),
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
      name: 'categories',
      type: 'array',
      title: 'Categories',
      of: [defineArrayMember({type: 'reference', to: {type: 'category'}})],
      group: 'meta',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'tags',
      type: 'array',
      title: 'Tags',
      description: 'Short topical labels displayed on article cards',
      of: [defineArrayMember({ type: 'string' })],
      group: 'meta',
      validation: (Rule) => Rule.required().min(3).max(3),
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
      ],
      validation: (Rule) => Rule.required().custom((value) => {
        const blocks = Array.isArray(value) ? value : []
        const textBlocks = blocks.filter((b: any) => b?._type === 'block')
        if (textBlocks.length < 3) return 'Body must contain at least 3 text paragraphs.'
        const first = textBlocks[0]
        const firstText = Array.isArray(first?.children) ? first.children.map((c: any) => String(c?.text || '')).join(' ') : ''
        const cleanedFirst = String(firstText || '')
          .replace(/!\[[^\]]*\]\([^\)]*\)/g, '')
          .replace(/```[\s\S]*?```/g, '')
          .replace(/`[^`]*`/g, '')
          .replace(/\*\*|__|\*|_/g, '')
          .replace(/^\s*#{1,6}\s+/gm, '')
          .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
          .replace(/\s+/g, ' ')
          .trim()
        const imageOnly = /^!\[[^\]]*\]\([^\)]*\)$/.test((firstText || '').trim()) || /\.(jpg|jpeg|png|gif|webp|svg)\b/i.test(firstText || '')
        if (!cleanedFirst || imageOnly) return 'First paragraph must be readable text, not an image or filename.'
        return true
      }),
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
      name: 'adAnchorKeywords',
      type: 'array',
      title: 'Ad Anchor Keywords',
      description: 'Words or phrases that should trigger the popup on scroll.',
      of: [defineArrayMember({ type: 'string' })],
      group: 'meta',
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
      const {writer, views, readTime} = selection as any
      const v = typeof views === 'number' && views > 0 ? `${(views / 1_000_000).toFixed(1)}M views` : '—'
      const rt = typeof readTime === 'number' && readTime > 0 ? `${readTime} min` : ''
      return {
        ...selection,
        subtitle: `${writer ? `by ${writer}` : 'No writer'}${rt ? ` • ${rt}` : ''} • ${v}`
      }
    },
  },
})
