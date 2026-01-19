import { type SchemaTypeDefinition } from 'sanity'

export const spotlightConfigType: SchemaTypeDefinition = {
  name: 'spotlightConfig',
  title: '⭐ Spotlight Grid (12 Articles)',
  type: 'document',
  description: '📋 Add exactly 12 articles for the Spotlight grid. Drag to reorder. First article = first grid position.',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Spotlight Grid',
      hidden: true,
    },
    {
      name: 'items',
      title: '🎯 Spotlight Articles (Exactly 12)',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'post' }, { type: 'csa' }],
          options: {
            filter: ({ document }: any) => {
              const existingIds = document?.items?.map((item: any) => item._ref) || []
              if (existingIds.length === 0) return {}
              return {
                filter: '!(_id in $existingIds)',
                params: { existingIds }
              }
            },
          },
        },
      ],
      description: '📋 Add exactly 12 articles. Drag to reorder. Click "+ Add item" to search and add articles.',
      validation: (Rule: any) =>
        Rule.required()
          .length(12)
          .error('Must have exactly 12 articles in the spotlight grid')
          .custom((items: any[]) => {
            if (!items) return 'Spotlight grid requires exactly 12 articles'
            if (items.length !== 12) {
              return `You have ${items.length} articles. Please ${items.length < 12 ? 'add' : 'remove'} ${Math.abs(12 - items.length)} to reach exactly 12.`
            }
            const refs = items.map(i => i._ref)
            const uniqueRefs = new Set(refs)
            if (refs.length !== uniqueRefs.size) {
              return 'Duplicate articles detected. Each article can only appear once.'
            }
            return true
          })
    },
  ],
  preview: {
    select: {
      items: 'items',
    },
    prepare({ items }: any) {
      const count = items?.length || 0
      return {
        title: '⭐ Spotlight Grid',
        subtitle: count === 12 ? `✅ ${count} articles (Complete)` : `⚠️ ${count}/12 articles (${count < 12 ? 'Add' : 'Remove'} ${Math.abs(12 - count)})`,
      }
    },
  },
}
