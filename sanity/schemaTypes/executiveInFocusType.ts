import { defineField, defineType } from 'sanity'

export const executiveInFocusType = defineType({
    name: 'executiveInFocus',
    title: 'Executive in Focus',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Name',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'position',
            title: 'Position',
            type: 'string',
            description: 'e.g. President & CEO, Southwire Company',
        }),
        defineField({
            name: 'description',
            title: 'Headline / Description',
            type: 'text',
            rows: 3,
            description: 'The main headline text displayed below the name.',
        }),
        defineField({
            name: 'image',
            title: 'Portrait Image',
            type: 'image',
            options: {
                hotspot: true,
            },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'link',
            title: 'Link to Article',
            type: 'url',
            description: 'Where the "Read Exclusive Interview" button should link to.',
        }),
        defineField({
            name: 'publishedAt',
            title: 'Published At',
            type: 'datetime',
            initialValue: () => new Date().toISOString(),
            validation: (rule) => rule.required(),
        }),
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'position',
            media: 'image',
        },
    },
})
