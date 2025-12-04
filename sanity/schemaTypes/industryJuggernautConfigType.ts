import { type SchemaTypeDefinition } from 'sanity'

export const industryJuggernautConfigType: SchemaTypeDefinition = {
    name: 'industryJuggernautConfig',
    title: 'Industry Juggernauts Config',
    type: 'document',
    fields: [
        {
            name: 'title',
            title: 'Title',
            type: 'string',
            initialValue: 'Industry Juggernauts',
        },
        {
            name: 'items',
            title: 'Juggernaut Items',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        {
                            name: 'title',
                            title: 'Title',
                            type: 'string',
                        },
                        {
                            name: 'image',
                            title: 'Image',
                            type: 'image',
                            options: {
                                hotspot: true,
                            },
                        },
                        {
                            name: 'link',
                            title: 'Link',
                            type: 'string',
                        },
                        {
                            name: 'category',
                            title: 'Category Label',
                            type: 'string',
                            initialValue: 'Leadership',
                        },
                    ],
                    preview: {
                        select: {
                            title: 'title',
                            media: 'image',
                        },
                    },
                },
            ],
            description: 'List of industry juggernauts to display on the homepage',
        },
    ],
}
