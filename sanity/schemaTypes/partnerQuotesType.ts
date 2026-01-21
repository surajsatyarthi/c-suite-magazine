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
            { name: 'title', type: 'string', title: 'Job Title' },
            { name: 'company', type: 'string', title: 'Company' },
            { 
              name: 'logo', 
              type: 'image', 
              title: 'Company Logo',
              options: { hotspot: true }
            },
          ],
        }),
      ],
    }),
  ],
})
