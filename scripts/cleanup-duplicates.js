#!/usr/bin/env node
/**
 * Clean up Indian Oil duplicate articles
 * 1. Delete empty duplicate: c43dd4fb-0a43-4ca0-9667-93186058a9dd
 * 2. Unpublish good article: l1PaX4hS53uLi0tV4V3Bog (keep draft only)
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@sanity/client')

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    token: process.env.SANITY_WRITE_TOKEN,
    apiVersion: '2024-01-01',
    useCdn: false
})

const EMPTY_DUPLICATE_ID = 'c43dd4fb-0a43-4ca0-9667-93186058a9dd'
const GOOD_ARTICLE_ID = 'l1PaX4hS53uLi0tV4V3Bog'

async function cleanup() {
    try {
        console.log('=== Step 1: Delete Empty Duplicate ===')
        console.log(`Deleting: ${EMPTY_DUPLICATE_ID}`)

        // Delete both published and draft versions of duplicate
        await client.delete(EMPTY_DUPLICATE_ID).catch(() => console.log('  Published version not found'))
        await client.delete(`drafts.${EMPTY_DUPLICATE_ID}`).catch(() => console.log('  Draft version not found'))

        console.log('✅ Empty duplicate deleted\n')

        console.log('=== Step 2: Unpublish Good Article ===')
        console.log(`Unpublishing: ${GOOD_ARTICLE_ID}`)

        // Delete published version, keep draft
        await client.delete(GOOD_ARTICLE_ID)
        console.log('✅ Published version deleted - article is now draft-only\n')

        console.log('=== CLEANUP COMPLETE ===')
        console.log('Remaining: 1 article in draft status')
        console.log(`Draft ID: drafts.${GOOD_ARTICLE_ID}`)
        console.log(`View: http://localhost:3000/studio/structure/csa-articles;${GOOD_ARTICLE_ID}`)

    } catch (error) {
        console.error('❌ Error:', error.message)
        process.exit(1)
    }
}

cleanup()
