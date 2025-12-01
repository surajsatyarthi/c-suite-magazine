import { LaunchIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const advertisementType = defineType({
    name: 'advertisement',
    title: 'Advertisement',
    type: 'document',
    icon: LaunchIcon,
    fields: [
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'placement',
            title: 'Placement',
            type: 'string',
            options: {
                list: [
                    { title: 'Article Sidebar (Large)', value: 'article-sidebar-large' },
                    { title: 'In-Article', value: 'in-article' },
                    { title: 'Popup (Interstitial)', value: 'popup' },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'image',
            title: 'Image',
            type: 'image',
            options: {
                hotspot: true,
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'dimensions',
            title: 'Dimensions',
            type: 'object',
            fields: [
                { name: 'width', type: 'number', title: 'Width (px)' },
                { name: 'height', type: 'number', title: 'Height (px)' },
            ],
            description: 'Image dimensions in pixels (width x height)',
        }),
        defineField({
            name: 'targetUrl',
            title: 'Target URL',
            type: 'url',
            validation: (Rule) => Rule.required().uri({ scheme: ['http', 'https'] }),
        }),
        defineField({
            name: 'isActive',
            title: 'Active',
            type: 'boolean',
            initialValue: true,
        }),
        defineField({
            name: 'priority',
            title: 'Priority',
            type: 'number',
            initialValue: 0,
            description: 'Higher number = higher priority when multiple ads match.',
        }),
        defineField({
            name: 'startDate',
            title: 'Start Date',
            type: 'datetime',
        }),
        defineField({
            name: 'endDate',
            title: 'End Date',
            type: 'datetime',
        }),
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'placement',
            media: 'image',
            isActive: 'isActive',
        },
        prepare({ title, subtitle, media, isActive }) {
            return {
                title: title,
                subtitle: `${subtitle} ${isActive ? '(Active)' : '(Inactive)'}`,
                media: media,
            }
        },
    },
})
