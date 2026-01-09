import { defineType, defineField, defineArrayMember } from 'sanity'

export const partnerQuotesType = defineType({
  name: 'partnerQuotes',
  title: 'Partner Quotes Section',
  type: 'object',
  fields: [
    defineField({
      name: 'quotes',
      title: 'Partner Quotes',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'partnerQuote',
          title: 'Partner Quote',
          fields: [
            { name: 'quote', type: 'text', title: 'Quote' },
            { name: 'name', type: 'string', title: 'Name' },
            { name: 'title', type: 'string', title: 'Job Title' },
            { name: 'company', type: 'string', title: 'Company' },
          ],
        }),
      ],
    }),
  ],
})
