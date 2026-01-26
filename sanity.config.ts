'use client'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { presentationTool } from 'sanity/presentation'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId } from './sanity/env'
import { table } from '@sanity/table'
import { schema } from './sanity/schemaTypes'
import { structure } from './sanity/structure'
import { getBaseUrl } from './lib/urls'

import { map } from 'rxjs/operators'

import { CopyLinkAction } from './sanity/actions'

export default defineConfig({
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  document: {
    actions: (prev, context) => {
      // Only add to relevant types
      if (['post', 'csa'].includes(context.schemaType)) {
        return [...prev, CopyLinkAction]
      }
      return prev
    },
    productionUrl: async (prev, context) => {
      const { getClient, document } = context
      const client = getClient({ apiVersion })

      const origin = getBaseUrl()

      if (document._type === 'post') {
        const slug = (document.slug as any)?.current
        if (!slug) return prev
        const params = { id: document._id }
        // Fetch category to build correct URL
        const result = await client.fetch(
          `*[_id == $id][0]{ "category": categories[0]->slug.current }`,
          params
        )
        const category = result?.category || 'general'
        return `${origin}/category/${category}/${slug}`
      }

      if (document._type === 'csa') {
        const slug = (document.slug as any)?.current
        if (!slug) return prev
        return `${origin}/csa/${slug}`
      }

      return prev
    },
  },
  plugins: [
    structureTool({ structure }),
    table(),
    presentationTool({
      title: 'Preview',
      previewUrl: {
        origin: getBaseUrl(),
        previewMode: {
          enable: '/api/draft',
        },
      },
      resolve: {
        locations: (params, context) => {
          const { id, type } = params
          console.log('[Presentation Tool] Resolving location for:', { id, type })

          if (type === 'csa') {
            return context.documentStore
              .listenQuery(`*[_id == $id][0]{_id, slug}`, { id }, { perspective: 'previewDrafts' })
              .pipe(
                map((doc: any) => {
                  console.log('[Presentation Tool] CSA document:', doc)
                  if (doc?.slug?.current) {
                    const href = `/csa/${doc.slug.current}`
                    console.log('[Presentation Tool] Resolved CSA href:', href)
                    return {
                      locations: [
                        {
                          title: 'Preview',
                          href,
                        },
                      ],
                    }
                  }
                  console.warn('[Presentation Tool] CSA slug missing:', doc)
                  return null
                })
              )
          }

          if (type === 'post') {
            return context.documentStore
              .listenQuery(`*[_id == $id][0]{_id, slug, "category": categories[0]->slug.current}`, { id }, { perspective: 'previewDrafts' })
              .pipe(
                map((doc: any) => {
                  console.log('[Presentation Tool] Post document:', doc)
                  if (doc?.slug?.current) {
                    const cat = doc.category || 'general'
                    const href = `/category/${cat}/${doc.slug.current}`
                    console.log('[Presentation Tool] Resolved post href:', href)
                    return {
                      locations: [
                        { title: 'Preview', href }
                      ]
                    }
                  }
                  console.warn('[Presentation Tool] Post slug missing:', doc)
                  return null
                })
              )
          }

          console.warn('[Presentation Tool] Unknown document type:', type)
          return null
        }
      },
    }),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
