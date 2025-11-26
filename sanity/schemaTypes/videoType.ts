import { PlayIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const videoType = defineType({
    name: 'video',
    title: 'Video',
    type: 'object',
    icon: PlayIcon,
    fields: [
        defineField({
            name: 'url',
            type: 'url',
            title: 'Video URL',
            description: 'YouTube, Vimeo, or other video URL',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'caption',
            type: 'string',
            title: 'Caption',
            description: 'Optional caption for the video',
        }),
    ],
    preview: {
        select: {
            title: 'url',
            subtitle: 'caption',
        },
    },
})
