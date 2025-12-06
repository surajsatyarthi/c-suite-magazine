import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'

// Manually parse .env.local to avoid environment issues
const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')

function getEnvValue(key: string): string | undefined {
    const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'))
    return match ? match[1].trim() : undefined
}

const client = createClient({
    projectId: getEnvValue('NEXT_PUBLIC_SANITY_PROJECT_ID'),
    dataset: getEnvValue('NEXT_PUBLIC_SANITY_DATASET'),
    apiVersion: '2024-01-01',
    token: getEnvValue('SANITY_WRITE_TOKEN'),
    useCdn: false,
})

async function verifyContent() {
    console.log('🔍 Starting Content Integrity Verification...')
    let hasError = false

    try {
        // 1. Check for Duplicate Articles
        console.log('\n[1/3] Checking for duplicate articles...')
        const posts = await client.fetch(`*[_type == "post" && isHidden != true && !(_id in path("drafts.**"))] { 
      _id, 
      title, 
      "slug": slug.current 
    }`)

        const slugMap = new Map()
        const titleMap = new Map()
        let duplicateCount = 0

        for (const post of posts) {
            // Check Slug
            if (slugMap.has(post.slug)) {
                console.error(`   ❌ FAIL: Duplicate Slug found: "${post.slug}"`)
                console.error(`      - ID 1: ${slugMap.get(post.slug)}`)
                console.error(`      - ID 2: ${post._id}`)
                duplicateCount++
                hasError = true
            } else {
                slugMap.set(post.slug, post._id)
            }

            // Check Title (Warning only, or strict?) - Let's do strict for now based on user's previous issue.
            if (titleMap.has(post.title)) {
                // Titles might be effectively duplicates even if slugs differ.
                console.warn(`   ⚠️  WARNING: Duplicate Title found: "${post.title}"`)
                // We won't fail build on title dupes yet, but good to know.
            } else {
                titleMap.set(post.title, post._id)
            }
        }

        if (duplicateCount === 0) {
            console.log('   ✅ No duplicate slugs found.')
        }

        // 2. Check Juggernaut Configuration
        console.log('\n[2/3] Verifying Industry Juggernauts...')
        const juggernautConfig = await client.fetch(`*[_type == "industryJuggernautConfig"][0]`)

        if (!juggernautConfig || !juggernautConfig.items) {
            console.warn('   ⚠️  No Industry Juggernaut config found.')
        } else {
            // Check if they are backdated
            // We fetch articles that match the titles in the config
            const titles = juggernautConfig.items.map((i: any) => i.title)
            // Some titles might be short names "Elon Musk", verify against actual posts

            for (const item of juggernautConfig.items) {
                // Find the post by title match or link slug extraction
                // Link format: /category/cat-slug/post-slug
                const slugMatch = item.link?.split('/').pop()

                if (slugMatch) {
                    const post = await client.fetch(`*[_type == "post" && slug.current == $slug][0]{title, publishedAt}`, { slug: slugMatch })
                    if (post) {
                        const year = new Date(post.publishedAt).getFullYear()
                        if (year > 2019) {
                            console.error(`   ❌ FAIL: Juggernaut article "${post.title}" is NOT backdated (Year: ${year}). Must be < 2019.`)
                            hasError = true
                        } else {
                            // console.log(`   ✅ "${post.title}" is backdated (${year}).`) 
                        }
                    } else {
                        console.warn(`   ⚠️  Could not find post for Juggernaut link: ${item.link}`)
                    }
                }
            }
            console.log('   ✅ Juggernaut verification complete.')
        }

        // 3. Draft/Env Check (Optional simple check)
        // Ensure we are not deploying with a dataset that is obviously wrong if we can detect it.
        // (Skipping for now as standard env vars handle this)

    } catch (error) {
        console.error('❌ Error during verification:', error)
        process.exit(1)
    }

    if (hasError) {
        console.error('\n❌ VERIFICATION FAILED. See errors above.')
        process.exit(1)
    } else {
        console.log('\n✅ All Content Integrity Checks Passed.')
        process.exit(0)
    }
}

verifyContent()
