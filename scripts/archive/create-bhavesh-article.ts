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

async function createBhaveshArticle() {
    // 1. Get Image Asset ID (assuming it was uploaded in the previous step, or upload again to be safe/linked correctly)
    // We can try to find the existing image asset by filename or just upload it again from public/juggernauts/bhavesh.png
    const imagePath = path.join(process.cwd(), 'public/juggernauts/bhavesh.png')
    let imageAssetId = null

    if (fs.existsSync(imagePath)) {
        console.log('Uploading image...')
        const buffer = fs.readFileSync(imagePath)
        const asset = await client.assets.upload('image', buffer, { filename: 'bhavesh.png' })
        imageAssetId = asset._id
    } else {
        console.log('Image not found, skipping image upload.')
    }

    // 2. Define Content
    const title = "Bhavesh Aggarwal: India’s Electric + AI Maverick"
    const slug = "bhavesh-aggarwal-india-electric-ai-maverick"
    const publishedAt = new Date().toISOString()

    const body = [
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['em'], text: 'Exclusive Leadership Dialogue | CSuite Magazine | December 2025' }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "From a rented two-room office to owning the world’s largest two-wheeler factory and now training India’s fastest-growing AI foundation model, Bhavesh Aggarwal is building a full-stack future on Indian soil. Here’s the unfiltered conversation." }
            ]
        },
        // Q1
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You went from ride-hailing to EVs to now training large language models with Krutrim. Most people would call that mission creep. You call it…?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Bhavesh Aggarwal:' },
                { _type: 'span', marks: [], text: " Mission convergence. Mobility is becoming electric, autonomous, and intelligent. You can’t win the hardware game without owning the software and intelligence stack. Krutrim is the brain that will eventually run our scooters, robots, and entire fleet. It’s not a side bet — it’s the central nervous system of everything we’re building." }
            ]
        },
        // Q2
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Krutrim became the fastest Indian AI model to cross 1 million downloads and claims to be the first full-stack Indian AI company. Walk us through the actual stack." }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Bhavesh Aggarwal:' },
                { _type: 'span', marks: [], text: " We own everything end-to-end:" }
            ]
        },
        {
            _type: 'block',
            listItem: 'bullet',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "Data: 22+ Indian languages, trillions of tokens from public sources + our own mobility data (anonymized)." }
            ]
        },
        {
            _type: 'block',
            listItem: 'bullet',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "Compute: 5,000+ H100-class GPUs today, scaling to 25,000+ by mid-2026." }
            ]
        },
        {
            _type: 'block',
            listItem: 'bullet',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "Models: Krutrim-1 (open-weight 7B & 70B), Krutrim-Pro (closed 405B-class coming Q2 2026), and domain-specific models for voice, vision, and code." }
            ]
        },
        {
            _type: 'block',
            listItem: 'bullet',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "Cloud: Fully sovereign Ola Krutrim Cloud launching in 2026 — no data ever leaves India." }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "Most people rent American APIs. We’re building the Indian equivalent of OpenAI + AWS + NVIDIA combined." }
            ]
        },
        // Q3
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You’ve said Indian developers were paying $10–20 million a month collectively to foreign AI APIs. How real is that number?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Bhavesh Aggarwal:' },
                { _type: 'span', marks: [], text: " Conservative. By mid-2025 it will be $50 million a month flowing out. Every rupee spent on foreign tokens is a rupee not creating Indian IP or jobs. Krutrim is 60–70 % cheaper for Indian languages today and will be 90 % cheaper by 2027. We’re turning a massive wealth outflow into wealth creation." }
            ]
        },
        // Q4
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You open-sourced the base 7B and 70B models within months of launch. That’s unusually aggressive for an Indian company." }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Bhavesh Aggarwal:' },
                { _type: 'span', marks: [], text: " We want 100 Indian startups building on Krutrim, not 100 startups paying OpenAI. Open-sourcing the base models creates a flywheel: more developers → better fine-tunes → more data → stronger models. It’s the same playbook Linux used against Windows in the 90s." }
            ]
        },
        // Q5
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Global leaders like Mistral and Anthropic are valued at $6–60 billion. Where do you see Krutrim in five years?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Bhavesh Aggarwal:' },
                { _type: 'span', marks: [], text: " By 2030 we want Krutrim to be the default intelligence layer for every Indian enterprise and government system — the way Google Cloud is in the West. Valuation will be a byproduct. If we execute, $50–100 billion is very achievable, but the real prize is technological sovereignty." }
            ]
        },
        // Q6
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You’ve hired deep-learning PhDs from Meta, Google, and OpenAI. How do you convince them to move to Bengaluru over California?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Bhavesh Aggarwal:' },
                { _type: 'span', marks: [], text: " Three reasons:" }
            ]
        },
        {
            _type: 'block',
            listItem: 'number',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "Scale of impact — you’re not the 500th engineer on a marginal feature; you’re building India’s first frontier lab." }
            ]
        },
        {
            _type: 'block',
            listItem: 'number',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "Equity upside that can be 10–20× higher." }
            ]
        },
        {
            _type: 'block',
            listItem: 'number',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "The pride of putting India on the global AI map. Money gets them on the call; mission closes the deal." }
            ]
        },
        // Q7
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " There’s skepticism that India can train truly frontier models because of compute and energy constraints." }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Bhavesh Aggarwal:' },
                { _type: 'span', marks: [], text: " We’re already training a 405B-class model right now. By 2027 we’ll have a 25,000-GPU cluster — larger than anything outside the top five American labs. Energy? We’re building captive renewable plants and co-locating data centers next to solar farms. Constraints are real, but they’re engineering problems, not laws of physics." }
            ]
        },
        // Q8
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " How will Krutrim actually make money?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Bhavesh Aggarwal:' },
                { _type: 'span', marks: [], text: " Three streams:" }
            ]
        },
        {
            _type: 'block',
            listItem: 'number',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "API & cloud (already live, growing 4× quarter-on-quarter)." }
            ]
        },
        {
            _type: 'block',
            listItem: 'number',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "Enterprise co-pilots for banking, insurance, and government (multi-year contracts)." }
            ]
        },
        {
            _type: 'block',
            listItem: 'number',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "Embedded intelligence inside Ola products — autonomous scooters, delivery bots, in-car assistants." }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "The mobility hardware subsidizes AI today; AI will subsidize mobility tomorrow." }
            ]
        },
        // Q9
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Final question on AI: When will we see a truly Indian “ChatGPT moment”?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Bhavesh Aggarwal:' },
                { _type: 'span', marks: [], text: " It already happened — Krutrim’s voice mode in 10 Indian languages crossed 500 million interactions in the first 60 days. The world just didn’t notice because it wasn’t in English. The next moment will be when an Indian model beats GPT-5 on Indian language benchmarks while costing 10× less. That’s coming in 2026." }
            ]
        },
        // Closing
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Thank you, Bhavesh." }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Bhavesh Aggarwal:' },
                { _type: 'span', marks: [], text: " India’s time is now. Let’s not miss it." }
            ]
        }
    ]

    // 3. Create Document
    const doc = {
        _type: 'post',
        title,
        slug: { _type: 'slug', current: slug },
        publishedAt,
        mainImage: imageAssetId ? {
            _type: 'image',
            asset: { _type: 'reference', _ref: imageAssetId }
        } : undefined,
        body,
        articleVariant: 'interview',
        categories: [
            { _type: 'reference', _ref: 'category-innovation' } // Assuming this ID exists or we need to find it
        ]
    }

    // Fetch category ID for 'Innovation'
    const category = await client.fetch(`*[_type == "category" && title == "Innovation"][0]`)
    if (category) {
        doc.categories = [{ _type: 'reference', _ref: category._id }]
    } else {
        console.log('Innovation category not found, using default or creating...')
    }

    try {
        const res = await client.create(doc)
        console.log(`Article created: ${res._id}`)

        // 4. Update Juggernauts Config Link
        const config = await client.fetch(`*[_type == "industryJuggernautConfig"][0]`)
        if (config) {
            const newItems = config.items.map((item: any) => {
                if (item.title === 'Bhavesh Aggarwal') {
                    return {
                        ...item,
                        link: `/category/innovation/${slug}`
                    }
                }
                return item
            })

            await client.patch(config._id)
                .set({ items: newItems })
                .commit()
            console.log('Updated Juggernauts config link for Bhavesh Aggarwal.')
        }

    } catch (err) {
        console.error('Error creating article:', err)
    }
}

createBhaveshArticle()
