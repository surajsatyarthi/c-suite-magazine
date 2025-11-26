import { LaunchIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const adType = defineType({
  name: 'adTrigger',
  title: 'Ad Trigger',
  type: 'object',
  icon: LaunchIcon,
  fields: [
    defineField({
      name: 'note',
      type: 'string',
      title: 'Note',
      description: 'The popup ad configured in Metadata will appear when the user scrolls to this point.',
      initialValue: 'Popup Ad Trigger',
      readOnly: true,
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Popup Ad Trigger',
        subtitle: 'Triggers the ad configured in Metadata',
        media: LaunchIcon,
      }
    },
  },
})
