/**
 * SANITY CONFIGURATION - SINGLE SOURCE OF TRUTH
 * 
 * This file centralizes the configuration for both the Next.js App and the Sanity CLI.
 * It prevents "Split-Brain" issues where the Studio and the Website look at different datasets.
 */

export const config = {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01',
    // The studio host used in sanity.cli.ts
    studioHost: process.env.NEXT_PUBLIC_SANITY_STUDIO_HOST || 'ceo-magazine',
    // Helper to validate formats
    useCdn: false,
}
