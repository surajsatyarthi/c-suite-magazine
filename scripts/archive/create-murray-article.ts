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

async function createMurrayArticle() {
    // 1. Get Image Asset
    const imagePath = path.join(process.cwd(), 'public/juggernauts/murray.png')
    let imageAssetId = null

    if (fs.existsSync(imagePath)) {
        console.log('Uploading image...')
        const buffer = fs.readFileSync(imagePath)
        const asset = await client.assets.upload('image', buffer, { filename: 'murray.png' })
        imageAssetId = asset._id
    } else {
        console.log('Image not found, skipping image upload.')
    }

    // 2. Define Content
    const title = "Murray Auchincloss: The Pragmatic Reset Steering BP Back to Value"
    const slug = "murray-auchincloss-pragmatic-reset-steering-bp-value"
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
                { _type: 'span', marks: [], text: "In the glass-walled executive suite overlooking St James’s Square, Murray Auchincloss sits with the calm of a man who has just pulled one of the boldest U-turns in energy history. Appointed permanent CEO in January 2024 after four months as interim, the 55-year-old Canadian has quietly dismantled much of the 2020 “net-zero by 2050” playbook and refocused BP on what it does best: deliver cash and energy reliably. The result? A share price up 45 % in 18 months and a market cap racing toward $150 billion. Here’s the unfiltered conversation." }
            ]
        },
        // Q1
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You inherited a company that had pledged to cut oil and gas production 40 % by 2030. Within a year you reversed course. What did the numbers tell you that the headlines missed?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Murray Auchincloss:' },
                { _type: 'span', marks: [], text: " The numbers were screaming. We were spending $18 billion a year to shrink the core business while betting on technologies that weren’t scaling fast enough to replace the cash flow. Shareholders were voting with their feet—our market cap had halved since 2020. I told the board: “We can’t be a charity for the energy transition; we have to fund it.” The reset was simple math: Grow hydrocarbons responsibly, generate cash, then invest in lower-carbon at pace we control." }
            ]
        },
        // Q2
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You’ve increased 2025-2027 oil & gas capex by $4 billion to $10 billion annually while cutting renewables by half. How do you square that with climate urgency?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Murray Auchincloss:' },
                { _type: 'span', marks: [], text: " Energy security is climate policy. If you let reliable supply collapse before alternatives are ready, you get price spikes, political backlash, and coal resurgence—exactly what happened in Europe post-Ukraine. Our plan: Keep lifting returns in oil & gas (targeting 18-20 % ROACE), buy back $20 billion of shares, and still grow low-carbon spending to $6-8 billion by 2030. It’s pragmatic decarbonization, not performative." }
            ]
        },
        // Q3
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " The $25 billion Kirkuk redevelopment in Iraq is your signature deal. Critics call it a step backward into high-risk geopolitics." }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Murray Auchincloss:' },
                { _type: 'span', marks: [], text: " Kirkuk is low-cost, high-return, and adds 500,000 bpd of much-needed supply by 2028. Breakeven under $30/barrel, carbon intensity in the global bottom quartile. We’re not chasing volume for volume’s sake; we’re chasing value and energy that the world still needs. Risk is managed—political, reservoir, security—because we’ve operated in Iraq for decades." }
            ]
        },
        // Q4
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You’ve centralized decision-making and cut layers. How deep did the bureaucracy go?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Murray Auchincloss:' },
                { _type: 'span', marks: [], text: " Too deep. We had 23 layers in some parts—more than the Canadian military. We’re down to 10-12 now. Every dollar saved on overhead goes straight to shareholder returns or growth. Speed is the new moat in energy; you can’t pivot a supertanker with 50 committees." }
            ]
        },
        // Q5
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " BP’s U.S. shale arm (bpx energy) is now your fastest-growing business. What did the North Sea teach you that applies onshore?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Murray Auchincloss:' },
                { _type: 'span', marks: [], text: " Discipline. In the North Sea we learned to live with $40 oil; in the Permian we’re profitable at $25. bpx will add 200,000 boepd by 2027 at sub-$30 breakeven. It’s the same mindset: Engineer every dollar, optimize every well, and don’t fall in love with acreage." }
            ]
        },
        // Q6
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Biofuels, hydrogen, CCUS—where are you actually making money in the transition today?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Murray Auchincloss:' },
                { _type: 'span', marks: [], text: " Biofuels are cash-positive now—Archer-Daniels-Midland JV alone throws off $1 billion EBITDA. Hydrogen and CCUS are 5-10 years from scale, but we’re positioning: Teesside and Tangguh projects locked in. Offshore wind? We wrote down $1 billion and exited—we’ll buy power, not own turbines. Capital discipline means saying no more than yes." }
            ]
        },
        // Q7
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You kept your CFO title for months after becoming CEO. Why wear both hats?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Murray Auchincloss:' },
                { _type: 'span', marks: [], text: " Because finance is strategy in this industry. I needed line-of-sight on every dollar. We now have Kate Thomson as permanent CFO—brilliant operator—but those early months ensured the reset was rooted in numbers, not PowerPoints." }
            ]
        },
        // Q8
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Talent flight was a problem in 2022-2023. How did you stop the exodus?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Murray Auchincloss:' },
                { _type: 'span', marks: [], text: " Clarity and cash. We gave people a plan they could believe in: Growing dividends, $20 billion buybacks, and a simpler structure. Variable pay is now 70 % tied to returns and cash flow—not vague ESG scores. Good people want to win and be paid for winning." }
            ]
        },
        // Q9
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Three non-negotiables for BP’s next decade?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Murray Auchincloss:' },
                { _type: 'span', marks: [], text: " " }
            ]
        },
        {
            _type: 'block',
            listItem: 'number',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "Returns above 14 % through the cycle—non-negotiable with shareholders." }
            ]
        },
        {
            _type: 'block',
            listItem: 'number',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "Carbon intensity down 30-35 % by 2030—real reductions, not offsets." }
            ]
        },
        {
            _type: 'block',
            listItem: 'number',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "Optionality—preserve the balance sheet to pivot if the world accelerates or decelerates the transition." }
            ]
        },
        // Q10
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Final advice to energy CEOs facing the same pressures?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Murray Auchincloss:' },
                { _type: 'span', marks: [], text: " Be honest with yourself and your stakeholders. You can’t outrun physics or economics. Deliver energy people can afford, decarbonize at the pace capital and technology allow, and never apologize for making money while doing it. That’s how you survive the transition—and fund it." }
            ]
        },
        // Closing
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Thank you, Murray." }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Murray Auchincloss:' },
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
            { _type: 'reference', _ref: 'category-leadership' } // Leadership
        ]
    }

    // Fetch category ID for 'Leadership'
    const category = await client.fetch(`*[_type == "category" && title == "Leadership"][0]`)
    if (category) {
        doc.categories = [{ _type: 'reference', _ref: category._id }]
    }

    try {
        const res = await client.create(doc)
        console.log(`Article created: ${res._id}`)

        // 4. Update Juggernauts Config Link
        const config = await client.fetch(`*[_type == "industryJuggernautConfig"][0]`)
        if (config) {
            const newItems = config.items.map((item: any) => {
                if (item.title === 'Murray Auchincloss') {
                    return {
                        ...item,
                        link: `/category/leadership/${slug}`
                    }
                }
                return item
            })

            await client.patch(config._id)
                .set({ items: newItems })
                .commit()
            console.log('Updated Juggernauts config link for Murray Auchincloss.')
        }

    } catch (err) {
        console.error('Error creating article:', err)
    }
}

createMurrayArticle()
