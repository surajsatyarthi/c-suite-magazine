import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config({ path: '.env.local' })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2024-02-05',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
})

async function assignWriter() {
    // 1. Create or Get 'CSuite Editorial Team' Writer
    let writerId = null
    const existingWriter = await client.fetch(`*[_type == "writer" && slug.current == "csuite-editorial-team"][0]`)

    if (existingWriter) {
        console.log('Found existing CSuite Editorial Team writer:', existingWriter._id)
        writerId = existingWriter._id
    } else {
        console.log('Creating CSuite Editorial Team writer...')
        // We need an image. We'll try to use a generic one or upload a placeholder.
        // For now, let's see if we can find a logo or just use a placeholder buffer.
        // I'll create a simple 1x1 pixel png buffer for now if no image exists, 
        // or try to reuse an existing asset if possible.
        // Actually, let's try to find a logo in public/

        let imageAssetId = null
        const logoPath = path.join(process.cwd(), 'public/logo.png') // Guessing
        if (fs.existsSync(logoPath)) {
            const buffer = fs.readFileSync(logoPath)
            const asset = await client.assets.upload('image', buffer, { filename: 'logo.png' })
            imageAssetId = asset._id
        } else {
            // Fallback: Use the first image asset we can find in the system, or just skip image if not strictly required (but schema says required)
            // Schema says validation: (Rule) => Rule.required() for image.
            // Let's fetch ANY image asset to use as a placeholder.
            const anyAsset = await client.fetch(`*[_type == "sanity.imageAsset"][0]`)
            if (anyAsset) {
                imageAssetId = anyAsset._id
            }
        }

        if (!imageAssetId) {
            console.error('Could not find any image asset for writer profile.')
            return
        }

        const newWriter = {
            _type: 'writer',
            name: 'CSuite Editorial Team',
            slug: { _type: 'slug', current: 'csuite-editorial-team' },
            writerType: 'staff',
            image: { _type: 'image', asset: { _type: 'reference', _ref: imageAssetId } },
            bio: [
                {
                    _type: 'block',
                    style: 'normal',
                    children: [{ _type: 'span', text: 'The editorial team at CSuite Magazine.' }]
                }
            ]
        }

        const res = await client.create(newWriter)
        writerId = res._id
        console.log('Created writer:', writerId)
    }

    // 2. Update Juggernaut Articles
    const juggernautTitles = [
        "Elon Musk: Building the Future at Civilization Scale", // Need to match exact titles or slugs
        "Ratan Tata: A Legacy of Ethical Leadership",
        "Bhavesh Aggarwal: India's Electric AI Maverick", // Titles might vary slightly in my scripts vs actual docs
        "Ritesh Agarwal: The Billion-Dollar Hostel Kid Who Rewrote Global Hospitality",
        "Amin H. Nasser: The Steady Hand Guiding Energy's Next Chapter",
        "Chamath Palihapitiya: The SPAC King Turned Climate Tech Rebel",
        "Yi He: From Village Roots to Co-CEO of Crypto's Global Gateway",
        "Mohamed Alabbar: Dubai's Master Builder and the Next Frontier of Urban Innovation",
        "Murray Auchincloss: The Pragmatic Reset Steering BP Back to Value"
    ]

    // Better to fetch by slug or partial title match to be safe
    const slugs = [
        'elon-musk-building-future-civilization-scale',
        'ratan-tata-legacy-ethical-leadership',
        'bhavesh-aggarwal-india-electric-ai-maverick',
        'ritesh-agarwal-billion-dollar-hostel-kid-rewrote-global-hospitality',
        'amin-nasser-steady-hand-guiding-energy-next-chapter',
        'chamath-palihapitiya-spac-king-climate-tech-rebel',
        'yi-he-village-roots-co-ceo-crypto-global-gateway',
        'mohamed-alabbar-dubai-master-builder-urban-innovation',
        'murray-auchincloss-pragmatic-reset-steering-bp-value'
    ]

    for (const slug of slugs) {
        const article = await client.fetch(`*[_type == "post" && slug.current == $slug][0]`, { slug })
        if (article) {
            console.log(`Updating writer for: ${article.title}`)
            await client.patch(article._id)
                .set({ writer: { _type: 'reference', _ref: writerId } })
                .commit()
        } else {
            console.log(`Article not found for slug: ${slug}`)
        }
    }

    console.log('All articles updated.')
}

assignWriter()
