import { type SchemaTypeDefinition } from 'sanity'

export const spotlightConfigType: SchemaTypeDefinition = {
  name: 'spotlightConfig',
  title: 'Spotlight Config',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'cardCount',
      title: 'Card Count',
      type: 'number',
      description: 'Number of cards to show on the homepage spotlight grid',
      initialValue: 16,
      validation: (Rule) => Rule.min(1).max(50),
    },
    {
      name: 'items',
      title: 'Spotlight Items',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'post' }],
        },
      ],
      description: 'Ordered list of posts to feature in the spotlight',
    },
  ],
}
