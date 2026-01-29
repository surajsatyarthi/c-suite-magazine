#!/usr/bin/env node
/**
 * Convert Indian Oil markdown article to Portable Text and upload to Sanity draft
 * 
 * Draft ID: c43dd4fb-0a43-4ca0-9667-9318d8e29be5 (from browser URL)
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@sanity/client')
const fs = require('fs')
const crypto = require('crypto')

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
    apiVersion: '2024-01-01',
    useCdn: false
})

const DRAFT_ID = 'drafts.c43dd4fb-0a43-4ca0-9667-9318d8e29be5'

// Generate unique key for Sanity blocks
function generateKey() {
    return crypto.randomBytes(6).toString('hex')
}

// Create a text span
function createSpan(text, marks = []) {
    return {
        _key: generateKey(),
        _type: 'span',
        marks,
        text
    }
}

// Create a block (paragraph, heading, blockquote)
function createBlock(style, children, markDefs = []) {
    return {
        _key: generateKey(),
        _type: 'block',
        style,
        children,
        markDefs
    }
}

// Parse markdown line and identify if it contains bold text
function parseLineWithBold(text) {
    const spans = []
    const boldRegex = /\*\*(.+?)\*\*/g
    let lastIndex = 0
    let match

    while ((match = boldRegex.exec(text)) !== null) {
        // Add text before bold
        if (match.index > lastIndex) {
            spans.push(createSpan(text.substring(lastIndex, match.index)))
        }
        // Add bold text
        spans.push(createSpan(match[1], ['strong']))
        lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < text.length) {
        spans.push(createSpan(text.substring(lastIndex)))
    }

    // If no bold found, return single span
    return spans.length > 0 ? spans : [createSpan(text)]
}

// Convert markdown to Portable Text
function convertMarkdownToPortableText(markdown) {
    const lines = markdown.split('\n')
    const blocks = []

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        // Skip empty lines
        if (!line) continue

        // Skip the main title (first line that starts with #)
        if (line.startsWith('# ')) continue

        // H2 Heading
        if (line.startsWith('## ')) {
            const text = line.substring(3)
            blocks.push(createBlock('h2', [createSpan(text)]))
            continue
        }

        // Blockquote (standalone bold lines starting with **)
        if (line.startsWith('**') && line.endsWith('**') && !line.includes(' ', 10)) {
            const text = line.substring(2, line.length - 2)
            // Make blockquotes italic
            blocks.push(createBlock('blockquote', [createSpan(`"${text}"`, ['em'])]))
            continue
        }

        // Regular paragraph with possible inline bold
        const spans = parseLineWithBold(line)
        blocks.push(createBlock('normal', spans))
    }

    return blocks
}

async function uploadArticle() {
    try {
        // Read markdown file
        const markdown = fs.readFileSync('./indian-oil-2025-updated.md', 'utf8')

        console.log('Converting markdown to Portable Text...')
        const portableTextBlocks = convertMarkdownToPortableText(markdown)

        console.log(`Created ${portableTextBlocks.length} blocks`)

        console.log('\nCreating new CSA draft in Sanity...')

        const newDraft = {
            _type: 'csa',
            title: 'Leading India\'s Energy Transition: IndianOil Chairman Shrikant Madhav Vaidya on Building a Sustainable Future',
            slug: {
                _type: 'slug',
                current: 'leading-indias-energy-transition-indianoil-chairman-shrikant-madhav-vaidya-on-building-a-sustainable-future'
            },
            excerpt: 'As the biggest supplier of fuel in the world\'s second most populous country, Indian Oil Corporation has a pivotal role to play in the energy transition, explains Chairman Shrikant Madhav Vaidya.',
            body: portableTextBlocks
        }

        const result = await client.create(newDraft)

        console.log('✅ Article draft created successfully!')
        console.log(`Draft ID: ${result._id}`)
        console.log(`Revision: ${result._rev}`)
        console.log(`\nView in Studio: http://localhost:3000/studio/structure/csa-articles;${result._id}`)
        console.log(`\n⚠️  Note: Draft is missing required field 'mainImage' - add in Studio before publishing`)
    } catch (error) {
        console.error('❌ Error creating article:', error)
        process.exit(1)
    }
}

uploadArticle()
