import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env.local') })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    token: process.env.SANITY_API_TOKEN,
    apiVersion: '2024-10-28',
    useCdn: false,
})

// --- Logic from page.tsx ---
function cleanBody(blocks, postTitle) {
    const norm = (s) => String(s || '')
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s]/g, '')
        .toLowerCase()
        .trim()

    const b = blocks.slice()
    let removed = 0
    for (let i = 0; i < b.length && removed < 2; i++) {
        const blk = b[i]
        if (!blk || blk._type !== 'block') continue
        const text = Array.isArray(blk?.children)
            ? blk.children.map((c) => String(c?.text || '')).join(' ')
            : ''

        console.log(`[Clean] Checking: "${text.substring(0, 50)}..."`)

        if (norm(text).startsWith(norm(postTitle))) {
            console.log('[Clean] MATCH! Removing block.')
            b.splice(i, 1)
            removed++
            i--
            continue
        }
        break
    }
    return b
}

// --- Logic from PortableBody.tsx ---
function extractTextFromChildren(children) {
    try {
        return (children || [])
            .map((c) => String(c?.text || ''))
            .join(' ')
            .trim()
    } catch {
        return ''
    }
}

function isImagePathText(s) {
    const t = String(s || '').trim()
    if (!t) return false
    if (/!\[[^\]]*\]\([^\)]*\)/.test(t)) return true
    if (/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)(\?[^\s]*)?$)/i.test(t)) return true
    if (/([^\s]+\/)?[^\s]+\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i.test(t)) return true
    if (/^(images|image|assets|static)\/[\w\-\/]+\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i.test(t)) return true
    return false
}

function sanitizeBlocks(blocks) {
    try {
        return (blocks || [])
            .map((b) => {
                if (!b) return null
                if (b._type && b._type !== 'block' && b._type !== 'image') return null
                if (b._type !== 'block') return b

                const children = Array.isArray(b.children) ? b.children : []
                const wholeText = extractTextFromChildren(children)

                if (/^(rtf\d+|ansicpg\d+|cocoartf\d+|cocoatextscaling\d+|cocoaplatform\d+|fonttbl|colortbl|expandedcolortbl|pard|viewkind\d+|f\d+|cf\d+|lang\d+)$/i.test(wholeText)) return null
                if (/^(Times(?:\s+New)?\s*Roman|Times-?Roman)(\s*;\s*)?(ef?tab\d+)?$/i.test(wholeText)) return null
                if (/^ef?tab\d+$/i.test(wholeText)) return null
                if (/^(published|updated|last\s+updated)\s*(on|:)?\s*/i.test(wholeText)) return null
                if (/^\s*---\s*$/.test(wholeText)) return null
                if (/```/.test(wholeText)) return null
                if (isImagePathText(wholeText)) return null

                // Simplified children filter for debug
                const filteredChildren = children
                const afterText = extractTextFromChildren(filteredChildren)
                if (!afterText.trim()) return null

                return { ...b, children: filteredChildren }
            })
            .filter(Boolean)
    } catch (e) {
        console.error('Sanitize error:', e)
        return blocks
    }
}

async function run() {
    const slug = 'rich-stinson-visionary-leader-powering-america-s-electrification-future'
    const article = await client.fetch(`*[_type == "csa" && slug.current == $slug][0] {
    title,
    body
  }`, { slug })

    if (!article) {
        console.log('❌ Article not found')
        return
    }

    console.log(`Original Blocks: ${article.body.length}`)

    const cleaned = cleanBody(article.body, article.title)
    console.log(`After Clean: ${cleaned.length}`)

    const sanitized = sanitizeBlocks(cleaned)
    console.log(`After Sanitize: ${sanitized.length}`)

    if (sanitized.length > 0) {
        console.log('✅ Pipeline passed. Content should render.')
        console.log('First block:', JSON.stringify(sanitized[0], null, 2))
    } else {
        console.log('❌ Pipeline FAILED. All blocks removed.')
    }
}

run()
