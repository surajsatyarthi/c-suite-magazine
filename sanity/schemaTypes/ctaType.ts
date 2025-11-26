import { LaunchIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const ctaType = defineType({
    name: 'cta',
    title: 'Call to Action',
    type: 'object',
    icon: LaunchIcon,
    fields: [
        defineField({
            name: 'text',
            type: 'string',
            title: 'Button Text',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'url',
            type: 'url',
            title: 'Button URL',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'style',
            type: 'string',
            title: 'Button Style',
            options: {
                list: [
                    { title: 'Primary (Gold)', value: 'primary' },
                    { title: 'Outline', value: 'outline' },
                ],
                layout: 'radio',
            },
            initialValue: 'primary',
        }),
    ],
    preview: {
        select: {
            title: 'text',
            subtitle: 'url',
        },
        prepare({ title, subtitle }) {
            return {
                title: `CTA: ${title}`,
                subtitle: subtitle,
                media: LaunchIcon,
            }
        },
    },
})
