import { config } from './config'

export const apiVersion = config.apiVersion
export const dataset = config.dataset
export const projectId = config.projectId

// Safe token retrieval (checking multiple common names to be robust)
export const token = process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN

export const useCdn = false


