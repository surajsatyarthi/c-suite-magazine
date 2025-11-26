import { ImagesIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const carouselType = defineType({
    name: 'carousel',
    title: 'Image Carousel',
    type: 'object',
    icon: ImagesIcon,
    fields: [
        defineField({
            name: 'images',
            type: 'array',
            title: 'Images',
            of: [
                defineArrayMember({
                    type: 'image',
                    options: { hotspot: true },
                    fields: [
                        {
                            name: 'alt',
                            type: 'string',
                            title: 'Alternative text',
                        },
                        {
                            name: 'caption',
                            type: 'string',
                            title: 'Caption',
                        },
                    ],
                }),
            ],
            validation: (Rule) => Rule.required().min(2),
        }),
    ],
    preview: {
        select: {
            images: 'images',
        },
        prepare({ images }) {
            return {
                title: `Carousel (${images?.length || 0} images)`,
                subtitle: 'Swipeable image gallery',
                media: images?.[0],
            }
        },
    },
})
