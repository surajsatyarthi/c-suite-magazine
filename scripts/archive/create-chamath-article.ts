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

async function createChamathArticle() {
    // 1. Get Image Asset
    const imagePath = path.join(process.cwd(), 'public/juggernauts/chamath.png')
    let imageAssetId = null

    if (fs.existsSync(imagePath)) {
        console.log('Uploading image...')
        const buffer = fs.readFileSync(imagePath)
        const asset = await client.assets.upload('image', buffer, { filename: 'chamath.png' })
        imageAssetId = asset._id
    } else {
        console.log('Image not found, skipping image upload.')
    }

    // 2. Define Content
    const title = "Chamath Palihapitiya: The SPAC King Turned Climate Tech Rebel"
    const slug = "chamath-palihapitiya-spac-king-climate-tech-rebel"
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
                { _type: 'span', marks: [], text: "From refugee kid in Ottawa to Facebook’s growth wizard, billionaire SPAC architect, and now one of the loudest voices in climate tech and American renewal, Chamath Palihapitiya doesn’t do quiet chapters. At 49, he’s shut down new consumer funds, walked away from traditional VC, and is betting billions on nuclear fission, carbon removal, and rebuilding the middle class. Unfiltered, as always." }
            ]
        },
        // Q1
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You famously said “VC is dead.” Yet you’re raising the largest climate fund in history. Explain the pivot." }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Chamath Palihapitiya:' },
                { _type: 'span', marks: [], text: " Consumer internet is a solved game. Margins are collapsing, attention is saturated, and the incremental dollar creates zero new value. Hard science — fusion, fission, carbon capture, advanced manufacturing — is the last arbitrage left. These are trillion-dollar problems with 60–80 % gross margins if you crack them. That’s where real wealth gets created now." }
            ]
        },
        // Q2
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You’re all-in on nuclear. Most investors still see it as toxic. Why now?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Chamath Palihapitiya:' },
                { _type: 'span', marks: [], text: " Because physics doesn’t care about 1970s activism. Small modular reactors (Oklo), fusion pilots (Helion), and next-gen fission (TerraPower) are 5–7 years from commercial scale. Data centers alone will need 200+ GW of new carbon-free baseload by 2035. Nuclear is the only thing that scales 24/7/365. We’re going to look back at the anti-nuclear era the same way we look at leaded gasoline — insane." }
            ]
        },
        // Q3
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You took Social Capital public via IPO-D in 2024 after burning the SPAC bridge. Lessons from that wild ride?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Chamath Palihapitiya:' },
                { _type: 'span', marks: [], text: " SPACs were a blunt but useful instrument to force transparency on overvalued private unicorns. We made people billionaires and we made people cry — both were necessary. The 2021–2023 wipeout cleansed the system. Now we’re back to boring, profitable growth companies that actually deserve public oxygen." }
            ]
        },
        // Q4
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You’ve been brutal on Silicon Valley groupthink. What’s the core disease?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Chamath Palihapitiya:' },
                { _type: 'span', marks: [], text: " Intellectual incest. Same 12 schools, same 4 neighborhoods, same 3 conference circuits. Everyone optimizes for signaling instead of solving. The Valley forgot how to build real things — bridges, reactors, factories. We became cosplay engineers. I moved my family to Miami for a reason: lower ego density, higher builder density." }
            ]
        },
        // Q5
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You own the Golden State Warriors with a group that paid $450 million in 2010. Forbes now values the franchise at $9 billion. Best deal ever?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Chamath Palihapitiya:' },
                { _type: 'span', marks: [], text: " Mathematically yes, but the real return is social proof at scale. Owning an NBA team is the modern version of owning a railroad in the 1890s — it opens every door quietly. People want to be associated with winners. It’s a permanent marketing budget that prints money." }
            ]
        },
        // Q6
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You’ve talked openly about using psychedelics and float tanks for decision-making. Is that still part of the stack?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Chamath Palihapitiya:' },
                { _type: 'span', marks: [], text: " 100 %. Every quarter I do a 7-day silent retreat — no phone, no speaking, just thinking. The signal-to-noise ratio in modern life is negative. You can’t see multi-decade moves when you’re reacting to Slack pings. Psychedelics, done legally and intentionally, are like defragging your brain." }
            ]
        },
        // Q7
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You’ve said the American middle class is being “deliberately hollowed out.” Strong words." }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Chamath Palihapitiya:' },
                { _type: 'span', marks: [], text: " Not strong — arithmetic. Real wages flat for 40 years, housing up 8×, healthcare up 10×, education up 12×. That’s not an accident; it’s policy. We financialized everything and offshored the real economy. My new portfolio is explicitly pro-American-worker: factories in Ohio, power plants in Texas, mines in Nevada. If we don’t rebuild domestic supply chains, we lose the country." }
            ]
        },
        // Q8
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You endorsed and then un-endorsed political figures faster than most people change phones. Where are you politically in late 2025?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Chamath Palihapitiya:' },
                { _type: 'span', marks: [], text: " I’m a radical centrist. Pro-science, pro-merit, pro-immigration (legal, high-skill), anti-regulatory capture, anti-cronyism. I’ll back anyone — red, blue, or purple — who actually ships. Ideology is a luxury good for people who don’t have to make payroll." }
            ]
        },
        // Q9
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Three bets you’re willing to put your entire reputation on for the next decade?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Chamath Palihapitiya:' },
                { _type: 'span', marks: [], text: " " }
            ]
        },
        {
            _type: 'block',
            listItem: 'number',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "Nuclear power will be the largest wealth-creation event of the 2030s." }
            ]
        },
        {
            _type: 'block',
            listItem: 'number',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "Direct carbon removal at under $100/ton is solvable before 2030 (we’re already at $250 and dropping 40 % per year)." }
            ]
        },
        {
            _type: 'block',
            listItem: 'number',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "Bitcoin fixes monetary policy — the U.S. will own a strategic reserve by 2028." }
            ]
        },
        // Q10
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You walked away from consumer VC at the peak. Any regrets?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Chamath Palihapitiya:' },
                { _type: 'span', marks: [], text: " Zero. I made more money than I’ll ever spend. Now I get to work on problems that determine whether my kids inherit a first-world country or a museum. That’s real alpha." }
            ]
        },
        // Q11
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Final advice to every founder and CEO reading this?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Chamath Palihapitiya:' },
                { _type: 'span', marks: [], text: " Stop optimizing for vanity metrics. Build something that can’t be regulated away, copied in Shenzhen, or canceled on X. The game is now about atoms, energy, and intelligence — everything else is noise." }
            ]
        },
        // Closing
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Thank you, Chamath." }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Chamath Palihapitiya:' },
                { _type: 'span', marks: [], text: " Let’s go fix sh*t." }
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
            { _type: 'reference', _ref: 'category-innovation' } // Defaulting to Innovation, or maybe Leadership? User didn't specify. Innovation fits "Climate Tech Rebel".
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
                if (item.title === 'Chamath Palihapitiya') {
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
            console.log('Updated Juggernauts config link for Chamath Palihapitiya.')
        }

    } catch (err) {
        console.error('Error creating article:', err)
    }
}

createChamathArticle()
