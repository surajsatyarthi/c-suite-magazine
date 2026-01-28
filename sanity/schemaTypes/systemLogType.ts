import { defineField, defineType } from 'sanity'
import { ActivityIcon } from '@sanity/icons'

export const systemLogType = defineType({
  name: 'systemLog',
  title: 'System Log',
  type: 'document',
  icon: ActivityIcon,
  fields: [
    defineField({
      name: 'system',
      title: 'System Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Success', value: 'SUCCESS' },
          { title: 'Failure', value: 'FAILURE' },
          { title: 'Warning', value: 'WARNING' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'metadata',
      title: 'Metadata (JSON)',
      type: 'text',
      rows: 5,
      description: 'Optional JSON object with technical details',
    }),
    defineField({
      name: 'timestamp',
      title: 'Timestamp',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'system',
      subtitle: 'status',
      date: 'timestamp'
    },
    prepare({ title, subtitle, date }) {
      const emoji = subtitle === 'SUCCESS' ? '✅' : subtitle === 'FAILURE' ? '❌' : '⚠️'
      return {
        title: `${emoji} ${title}`,
        subtitle: `${new Date(date).toLocaleString()} - ${subtitle}`,
      }
    },
  },
})
