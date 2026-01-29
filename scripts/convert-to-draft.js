#!/usr/bin/env node
/**
 * Phase 2: Fix Indian Oil article status
 * Convert from published to draft
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

const PUBLISHED_ID = 'l1PaX4hS53uLi0tV4V3Bog'
const DRAFT_ID = `drafts.${PUBLISHED_ID}`

async function convertToDraft() {
    try {
        console.log('Fetching published article...')
        const published = await client.getDocument(PUBLISHED_ID)

        if (!published) {
            console.log('❌ Published article not found')
            return
        }

        console.log(`✅ Found published article: ${published.title}`)
        console.log(`   Body blocks: ${published.body?.length || 0}`)

        // Create draft version with same content
        console.log('\nCreating draft version...')
        const { _id, _rev, _createdAt, _updatedAt, ...content } = published

        const draft = await client.createOrReplace({
            ...content,
            _id: DRAFT_ID,
            _type: 'csa'
        })

        console.log(`✅ Draft created: ${draft._id}`)

        // Delete published version
        console.log('\nDeleting published version...')
        await client.delete(PUBLISHED_ID)
        console.log(`✅ Deleted published version`)

        console.log('\n✅ SUCCESS: Article is now a draft')
        console.log(`Draft ID: ${draft._id}`)
        console.log(`View: http://localhost:3000/studio/structure/csa-articles;${PUBLISHED_ID}`)

    } catch (error) {
        console.error('❌ Error:', error.message)
        process.exit(1)
    }
}

convertToDraft()
