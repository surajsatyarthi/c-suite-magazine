const idRegex = /^[a-z0-9-]+$/

const apiVersionRaw = process.env.NEXT_PUBLIC_SANITY_API_VERSION
const datasetRaw = process.env.NEXT_PUBLIC_SANITY_DATASET
const projectIdRaw = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID

export const apiVersion = apiVersionRaw || '2024-10-01'

export const dataset = idRegex.test(String(datasetRaw || ''))
  ? String(datasetRaw)
  : 'production'

export const projectId = idRegex.test(String(projectIdRaw || ''))
  ? String(projectIdRaw)
  : '2f93fcy8'

export const token = process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_TOKEN

