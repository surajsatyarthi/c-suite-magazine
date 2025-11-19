/**
* This configuration file lets you run `$ sanity [command]` in this folder
* Go to https://www.sanity.io/docs/cli to learn more.
**/
import { defineCliConfig } from 'sanity/cli'

// Provide safe fallbacks for projectId/dataset similar to sanity/env.ts
const idRegex = /^[a-z0-9-]+$/
const projectIdRaw = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const datasetRaw = process.env.NEXT_PUBLIC_SANITY_DATASET

const projectId = idRegex.test(String(projectIdRaw || ''))
  ? String(projectIdRaw)
  : '2f93fcy8'

const dataset = idRegex.test(String(datasetRaw || ''))
  ? String(datasetRaw)
  : 'production'

export default defineCliConfig({
  api: { projectId, dataset },
  // Set a non-interactive hosted Studio hostname; override via env when needed
  studioHost: process.env.SANITY_STUDIO_HOSTNAME || 'ceo-magazine-2f93fcy8',
  // Enable auto-updates (per current CLI expectation)
  deployment: { autoUpdates: true },
})
