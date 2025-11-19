'use client'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {dashboardTool} from '@sanity/dashboard'
import {OverviewCountsWidget, QuickLinksWidget} from './sanity/dashboardWidgets'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import {apiVersion, dataset, projectId} from './sanity/env'
import {schema} from './sanity/schemaTypes'
import {structure} from './sanity/structure'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  document: {},
  plugins: [
    structureTool({structure}),
    dashboardTool({
      widgets: [
        { name: 'overview-counts', component: OverviewCountsWidget, layout: { width: 'medium' } },
        { name: 'quick-links', component: QuickLinksWidget, layout: { width: 'medium' } },
      ]
    }),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({defaultApiVersion: apiVersion}),
  ],
})
