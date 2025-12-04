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

async function createRiteshArticle() {
    // 1. Get Image Asset
    const imagePath = path.join(process.cwd(), 'public/juggernauts/ritesh.png')
    let imageAssetId = null

    if (fs.existsSync(imagePath)) {
        console.log('Uploading image...')
        const buffer = fs.readFileSync(imagePath)
        const asset = await client.assets.upload('image', buffer, { filename: 'ritesh.png' })
        imageAssetId = asset._id
    } else {
        console.log('Image not found, skipping image upload.')
    }

    // 2. Define Content
    const title = "Ritesh Agarwal: The Billion-Dollar Hostel Kid Who Rewrote Global Hospitality"
    const slug = "ritesh-agarwal-billion-dollar-hostel-kid-rewrote-global-hospitality"
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
                { _type: 'span', marks: [], text: "At 31, Ritesh Agarwal has gone from dropping out of college to run OYO — the world’s third-largest hotel chain by room count, present in 80+ countries, and now profitable across core markets. From a single Kota guesthouse in 2013 to a $10 billion valuation peak and a dramatic 2024 turnaround, he remains the youngest self-made billionaire in India. Here’s the no-filter conversation." }
            ]
        },
        // Q1
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You started OYO at 19 with ₹40,000. Twelve years later you’re in 800 cities. What’s the real engine behind that speed?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Ritesh Agarwal:' },
                { _type: 'span', marks: [], text: " Obsession with the customer nobody else wanted. In 2013, budget travelers in India were getting fleeced — broken ACs, dirty sheets, no Wi-Fi. We said: What if every ₹1,499 room felt like a ₹5,000 experience? Standardization at the bottom of the pyramid is the hardest problem in hospitality, but it’s also the biggest moat." }
            ]
        },
        // Q2
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " 2019–2022 was brutal — valuation crashed 80 %, layoffs, debt. You bought back $2 billion of shares yourself at 23. How did you stare down bankruptcy?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Ritesh Agarwal:' },
                { _type: 'span', marks: [], text: " I stopped listening to headlines and started listening to unit economics. We were drunk on growth capital — 50+ countries, 1 million rooms, zero profitability. The reset was painful but simple: shut unprofitable markets, fire 5,000 people, and get every property to positive EBITDA before adding the next one. By mid-2024 we were free-cash-flow positive for six straight quarters. Lesson: growth is oxygen; profit is food." }
            ]
        },
        // Q3
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You personally own ~30 % after the $2 billion founder buyback. Most founders dilute to 5–10 %. Why go the opposite way?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Ritesh Agarwal:' },
                { _type: 'span', marks: [], text: " Alignment. If I’m asking my team to think 20 years out, I better have permanent skin in the game. The buyback was funded by SoftBank and myself — we took the same terms as any investor. When the company wins, employees and early believers win bigger. That’s how you build a 100-year company, not a five-year exit." }
            ]
        },
        // Q4
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " OYO is now the largest hotel brand in the U.S. by franchise locations after acquiring G6 Hospitality (Motel 6). How does a 31-year-old Indian kid outmaneuver Hilton and Marriott?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Ritesh Agarwal:' },
                { _type: 'span', marks: [], text: " We don’t compete on marble lobbies; we compete on yield per square foot. U.S. budget travelers want clean, safe, predictable — exactly what we perfected in India. G6 had 1,400 motels losing money. We’re converting them at $8,000 per key (vs. $80,000 for a new build) and lifting RevPAR 30 % in the first year. Asset-light + tech + obsessive execution beats legacy scale every time." }
            ]
        },
        // Q5
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You’re launching “OYO Premium” and co-living. Is the vision still budget, or are you moving upmarket?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Ritesh Agarwal:' },
                { _type: 'span', marks: [], text: " Budget is the soul, but humans aspire. We’ll always own the ₹999–₹2,999 segment in India and the $59–$99 segment globally. Premium (Sunday Hotels, Townhouse) and co-living (OYO Life 2.0) are for the same customer five years later. One brand, lifetime relationship." }
            ]
        },
        // Q6
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Talent is the hottest topic in Indian startups. How do you keep senior leaders when Big Tech and U.S. firms pay 3×?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Ritesh Agarwal:' },
                { _type: 'span', marks: [], text: " Stock and story. Our top 200 leaders own meaningful equity — many became crorepati in the 2024 rally. More importantly, they’re building the first truly global Indian consumer brand. You can make $10 million at Google or help put India on the world hospitality map. Different people choose different things." }
            ]
        },
        // Q7
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You married at 29, became a father, and still work 16-hour days. How do you think about life balance?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Ritesh Agarwal:' },
                { _type: 'span', marks: [], text: " I don’t believe in balance; I believe in seasons. There are founder seasons and family seasons. Right now we’re in the “make OYO undeniable” season. My wife understands the mission — she grew up watching me code the first OYO website. When the company can run without me for 90 days, I’ll take a 90-day sabbatical. That’s the deal I made with myself." }
            ]
        },
        // Q8
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Government relations have swung from red tape to red carpet. What changed?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Ritesh Agarwal:' },
                { _type: 'span', marks: [], text: " Results. When we were burning cash, we were a problem. When we started paying GST worth thousands of crores and creating 100,000+ direct jobs, we became a partner. Tourism is 8 % of India’s GDP — we’re the largest private contributor now. Respect is earned one profitable quarter at a time." }
            ]
        },
        // Q9
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Three bets you’re willing to be judged on in 2035?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Ritesh Agarwal:' },
                { _type: 'span', marks: [], text: " " }
            ]
        },
        {
            _type: 'block',
            listItem: 'number',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "OYO will be the largest hospitality company in the world by rooms under management (not valuation — actual keys)." }
            ]
        },
        {
            _type: 'block',
            listItem: 'number',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "India will have 10+ homegrown global consumer brands valued above $50 billion each." }
            ]
        },
        {
            _type: 'block',
            listItem: 'number',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "Budget travel will be the biggest wealth creator for the middle class in emerging markets." }
            ]
        },
        // Q10
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Final piece of advice to every 19-year-old reading this?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Ritesh Agarwal:' },
                { _type: 'span', marks: [], text: " Start before you’re ready. The world rewards action, not perfection. Solve a problem you personally feel every day — that pain is your unfair advantage." }
            ]
        },
        // Closing
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Thank you, Ritesh." }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Ritesh Agarwal:' },
                { _type: 'span', marks: [], text: " Thank you. Onward." }
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
            { _type: 'reference', _ref: 'category-innovation' } // Defaulting to Innovation
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
                if (item.title === 'Ritesh Agarwal') {
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
            console.log('Updated Juggernauts config link for Ritesh Agarwal.')
        }

    } catch (err) {
        console.error('Error creating article:', err)
    }
}

createRiteshArticle()
