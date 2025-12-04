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

async function createAminArticle() {
    // 1. Get Image Asset
    const imagePath = path.join(process.cwd(), 'public/juggernauts/amin.png')
    let imageAssetId = null

    if (fs.existsSync(imagePath)) {
        console.log('Uploading image...')
        const buffer = fs.readFileSync(imagePath)
        const asset = await client.assets.upload('image', buffer, { filename: 'amin.png' })
        imageAssetId = asset._id
    } else {
        console.log('Image not found, skipping image upload.')
    }

    // 2. Define Content
    const title = "Amin H. Nasser: The Steady Hand Guiding Energy's Next Chapter"
    const slug = "amin-nasser-steady-hand-guiding-energy-next-chapter"
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
                { _type: 'span', marks: [], text: "In the executive suites of Aramco's Dhahran headquarters—overlooking the vast Ghawar oil field, the world's largest by reserves—Amin H. Nasser reflects on four decades of steering the globe's most valuable energy company through booms, crises, and transitions. At 69, the petroleum engineer turned CEO has led Aramco's 2019 IPO, the SABIC acquisition, and a pivot toward cleaner fuels, all while advocating for pragmatic energy realism. This conversation distills his executive philosophy amid 2025's volatile markets." }
            ]
        },
        // Q1
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You joined Aramco as a fresh engineering graduate in 1982. What early lesson from the field floors shaped your view of long-term leadership?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Amin H. Nasser:' },
                { _type: 'span', marks: [], text: " The oil patch teaches humility and resilience. I started in production engineering, troubleshooting wells under desert sun—nothing prepares you for the raw unpredictability of reservoirs. Early on, a single equipment failure could halt output for days; it drilled into me that leadership isn't about control, but about systems that endure shocks. Today, with Aramco producing 12 million barrels daily, that principle scales: Build for the long haul, not the quarterly headline." }
            ]
        },
        // Q2
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Aramco's 2019 IPO was the world's largest at $29.4 billion. How did you navigate the geopolitics and investor skepticism around a state-owned giant going public?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Amin H. Nasser:' },
                { _type: 'span', marks: [], text: " It was a high-stakes balancing act—aligning Vision 2030's diversification goals with global capital's demand for transparency. We didn't sell the company; we invited partners into its strength. Pre-IPO, we upgraded governance, audited reserves independently, and communicated relentlessly: Aramco isn't just oil; it's integrated energy with unmatched low-cost assets. The Tadawul debut validated that—$1.7 trillion market cap at peak. Lesson: Trust is earned through deeds, not declarations." }
            ]
        },
        // Q3
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " The 2019 Abqaiq drone attacks tested Aramco like nothing else, knocking out 5% of global supply overnight. How do you prepare executives for black-swan disruptions?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Amin H. Nasser:' },
                { _type: 'span', marks: [], text: " We restored full capacity in weeks because resilience was baked in—redundant facilities, rapid-response teams, and scenario drills since the 1990s Gulf War. But it was a wake-up: Geopolitical risks are asymmetric now. For CEOs, the playbook is dual: Harden your core (cyber, supply chains) while diversifying quietly. Aramco's response minimized market panic; that's the real win—stability breeds confidence." }
            ]
        },
        // Q4
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You've warned against \"abandoning\" oil and gas prematurely, calling divestment fantasies that risk inflation and unrest. In 2025's net-zero push, how do you thread that needle?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Amin H. Nasser:' },
                { _type: 'span', marks: [], text: " Energy transition isn't a light switch; it's a marathon. Demand for oil and gas will grow 20-30% by 2050 per IEA baselines—we can't wish that away without economic chaos. Aramco invests $50 billion annually: 70% in core hydrocarbons for reliability, 30% in blues (hydrogen, CCUS, renewables). We've captured 10 million tons of CO2 yearly and aim for net-zero Scope 1&2 by 2050. Pragmatism over dogma: Meet demand cleanly, or face shortages." }
            ]
        },
        // Q5
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " The 2020 SABIC acquisition made Aramco the world's top petrochemical player. What drove that bet on downstream, and how's it paying off?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Amin H. Nasser:' },
                { _type: 'span', marks: [], text: " Upstream volatility—OPEC cuts, price swings—demanded balance. SABIC added high-margin chemicals, turning crude into plastics and fuels with 20%+ returns. Post-acquisition, we've integrated operations, launched joint ventures in China and India, and boosted output 15%. It's transformed Aramco from producer to value-chain leader—resilient in downturns, growth engine in upswings." }
            ]
        },
        // Q6
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Aramco's upstream ops under your early SVPs tenure handled the largest capex program ever. How do you scale talent in a capital-intensive industry?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Amin H. Nasser:' },
                { _type: 'span', marks: [], text: " Saudi talent is our edge—90% Saudization in technical roles. I mentor through KAUST and KFUPM boards, emphasizing hands-on rotations like my own from drilling to reservoirs. Retention? Competitive pay plus purpose: We're not just extracting; we're powering 8 billion lives sustainably. In hyper-scale, hire for adaptability—engineers who code as well as they drill." }
            ]
        },
        // Q7
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " China remains Aramco's top buyer, with 2025 deals like the $10 billion refinery JV. How do you view U.S.-China tensions impacting energy trade?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Amin H. Nasser:' },
                { _type: 'span', marks: [], text: " Asia's the growth story—China's 5% GDP target means 1 million bpd more demand. Aramco hedges geopolitics with multipolar supply: U.S. shale for flexibility, our low-breakeven barrels for stability. Tensions accelerate diversification—more JVs in the Gulf, Africa. Energy's too vital for silos; collaboration wins." }
            ]
        },
        // Q8
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You've served on MIT, JPMorgan, and WEF boards. What global insight surprises most CEOs?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Amin H. Nasser:' },
                { _type: 'span', marks: [], text: " The speed of convergence—AI optimizing refineries, blockchain for carbon credits. But the surprise? Soft power: Aramco's $1 billion annual R&D isn't just tech; it's talent exchange, like our Columbia exec program. Boards taught me: Influence flows from convening, not commanding." }
            ]
        },
        // Q9
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Aramco's 2025 capex hits $60 billion, split across oil, chemicals, and new energies. How do you allocate in uncertain markets?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Amin H. Nasser:' },
                { _type: 'span', marks: [], text: " Data-driven discipline: 40% upstream sustainment, 30% growth projects, 20% downstream, 10% transition tech. We model scenarios to 2050—OPEC+, IEA, BloombergNEF. Flexibility is key: Pause non-core if prices dip below $50. Returns rule—every dollar must yield 12%+ IRR." }
            ]
        },
        // Q10
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Three non-negotiables for Aramco's next decade?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Amin H. Nasser:' },
                { _type: 'span', marks: [], text: " " }
            ]
        },
        {
            _type: 'block',
            listItem: 'number',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "Affordability—keep our $3-4 breakeven to anchor markets." }
            ]
        },
        {
            _type: 'block',
            listItem: 'number',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "Agility—$10 billion in digital twins and AI for 20% efficiency gains." }
            ]
        },
        {
            _type: 'block',
            listItem: 'number',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "Accountability—full Scope 3 emissions reporting by 2026, with real offsets." }
            ]
        },
        // Q11
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Final counsel to energy leaders in transition?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Amin H. Nasser:' },
                { _type: 'span', marks: [], text: " Passion alone fades; pair it with purpose. Ask: Does this secure energy for generations? Lead boldly, but listen widely—your legacy is the stability you leave behind." }
            ]
        },
        // Closing
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Thank you, Amin." }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Amin H. Nasser:' },
                { _type: 'span', marks: [], text: " The honor is ours. Forward." }
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
            { _type: 'reference', _ref: 'category-leadership' } // Leadership seems appropriate for "Leadership Dialogue"
        ]
    }

    // Fetch category ID for 'Leadership'
    const category = await client.fetch(`*[_type == "category" && title == "Leadership"][0]`)
    if (category) {
        doc.categories = [{ _type: 'reference', _ref: category._id }]
    } else {
        console.log('Leadership category not found, checking Innovation...')
        const catInnovation = await client.fetch(`*[_type == "category" && title == "Innovation"][0]`)
        if (catInnovation) {
            doc.categories = [{ _type: 'reference', _ref: catInnovation._id }]
        }
    }

    try {
        const res = await client.create(doc)
        console.log(`Article created: ${res._id}`)

        // 4. Update Juggernauts Config Link
        const config = await client.fetch(`*[_type == "industryJuggernautConfig"][0]`)
        if (config) {
            const newItems = config.items.map((item: any) => {
                if (item.title === 'Amin H. Nasser') {
                    return {
                        ...item,
                        link: `/category/leadership/${slug}` // Or innovation, depending on what we set above. Let's assume Leadership.
                    }
                }
                return item
            })

            await client.patch(config._id)
                .set({ items: newItems })
                .commit()
            console.log('Updated Juggernauts config link for Amin H. Nasser.')
        }

    } catch (err) {
        console.error('Error creating article:', err)
    }
}

createAminArticle()
