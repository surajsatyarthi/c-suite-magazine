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

async function createYiHeArticle() {
    // 1. Get Image Asset
    const imagePath = path.join(process.cwd(), 'public/juggernauts/he.png')
    let imageAssetId = null

    if (fs.existsSync(imagePath)) {
        console.log('Uploading image...')
        const buffer = fs.readFileSync(imagePath)
        const asset = await client.assets.upload('image', buffer, { filename: 'he.png' })
        imageAssetId = asset._id
    } else {
        console.log('Image not found, skipping image upload.')
    }

    // 2. Define Content
    const title = "Yi He: From Village Roots to Co-CEO of Crypto's Global Gateway"
    const slug = "yi-he-village-roots-co-ceo-crypto-global-gateway"
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
                { _type: 'span', marks: [], text: "In the sleek, sunlit boardrooms of Binance's Dubai headquarters—a neutral hub symbolizing the exchange's global pivot—Yi He, freshly appointed Co-CEO alongside Richard Teng, shares her improbable rise. From a rural Chinese village to co-founding the world's largest crypto platform with 250 million users, the 41-year-old former TV host has shaped Binance's culture, weathered U.S. regulatory storms, and now eyes a billion-user future. This conversation captures her blend of grit, optimism, and strategic calm." }
            ]
        },
        // Q1
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You grew up in a poor village in Hainan, left home at 16, and became a TV host before crypto. What early hustle prepared you for building Binance?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Yi He:' },
                { _type: 'span', marks: [], text: " Necessity. Life in the village taught me resilience—fetching water at dawn, helping with rice harvests. Moving to Beijing alone at 16 to chase education forced independence. Hosting on TV honed storytelling and poise, but crypto? That was pure instinct. In 2014 at OKCoin, I saw digital assets as the internet's next wave—borderless, empowering the unbanked. No fancy degree; just a drive to challenge limits." }
            ]
        },
        // Q2
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You co-founded Binance with CZ in 2017 from a small team in China. It hit $1 billion in revenue in months. What was the secret to that explosive start?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Yi He:' },
                { _type: 'span', marks: [], text: " User obsession. We launched with a simple exchange that was faster, cheaper, and more intuitive than competitors. No marketing budget—just word-of-mouth in WeChat groups. By focusing on low fees and 24/7 support, we grew from 100 users to millions. Early days were chaotic—servers crashing during bull runs—but that fire-tested us. Success isn't luck; it's solving pain points nobody else touches." }
            ]
        },
        // Q3
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Binance Labs, under your lead, has invested in 250+ projects like Polygon and Axie Infinity. How do you spot winners in a sea of hype?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Yi He:' },
                { _type: 'span', marks: [], text: " Fundamentals over flash. We back teams building real utility—cross-chain bridges, DeFi for emerging markets—not memes. Radiant Capital's $10 million round in 2023? Their seamless lending across chains screamed mass adoption. In 2025, we're doubling down on AI-crypto intersections and tokenized real-world assets. Rule: If it doesn't scale to billions without breaking, pass." }
            ]
        },
        // Q4
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " The 2023 U.S. settlement hit $4.3 billion, CZ served time, and Binance faced bans. As the \"behind-the-scenes\" force, how did you steer through that storm?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Yi He:' },
                { _type: 'span', marks: [], text: " It was our darkest hour, but also clarifying. I focused on culture—rallying 8,000 employees with town halls: \"We're building for the long game, not headlines.\" We complied fully, exited high-risk markets, and strengthened AML/KYC. CZ's four months in prison (released September 2024) was heartbreaking, but his pardon in October freed us. Resilience? Rooted in our mission: Crypto democratizes finance. We emerged stronger, with user trust at all-time highs." }
            ]
        },
        // Q5
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Your August 2025 Fortune interview called Binance \"resilient.\" Now as Co-CEO since December 3, what's the first priority with Richard Teng?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Yi He:' },
                { _type: 'span', marks: [], text: " Seamless integration—his compliance expertise, my product vision. Top line: Onboard the next 750 million users safely. We're expanding Web3 wallets, education via Binance Academy, and regulated products like spot Bitcoin ETFs. No zero-sum fights; crypto's positive-sum. We'll be the gateway: Easy entry for newbies, deep tools for pros." }
            ]
        },
        // Q6
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You've pushed for \"the Google of Web3\"—a billion users by making crypto invisible and intuitive. How?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Yi He:' },
                { _type: 'span', marks: [], text: " Accessibility first. Like Google simplified search, we simplify finance: One-click fiat ramps, AI chat support in 100 languages. Dubai Blockchain Week 2024? I announced partnerships for real-world apps—remittances in Africa, micro-loans in Southeast Asia. Regulators are partners now; we're in talks for licensed stablecoins. Goal: Crypto as utility, not speculation." }
            ]
        },
        // Q7
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " As one of few women leading crypto (and Binance's first English interview in 2022), how do you build diverse teams in a male-dominated space?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Yi He:' },
                { _type: 'span', marks: [], text: " Lead by example. I mentor women in tech via Binance Women, pushing for 40% female hires by 2027. Early on, English was my barrier—I started lessons at 36—but vulnerability builds connection. Talent ignores gender; we hire for grit and curiosity. In China, I saw too many overlooked voices; here, we amplify them." }
            ]
        },
        // Q8
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Binance's 2025 revenue could top $20 billion amid Bitcoin's rally. How do you balance growth with sustainability?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Yi He:' },
                { _type: 'span', marks: [], text: " Profit with purpose. We're carbon-neutral since 2022, investing in green data centers. Revenue funds innovation—$500 million for Labs in 2026. But metrics matter: User retention over volume. If a feature confuses 1% of users, kill it. Sustainability means thriving through cycles, not just bull markets." }
            ]
        },
        // Q9
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You've tweeted on scams and transparency (February 2024). With hacks rising, how does Binance stay the safest exchange?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Yi He:' },
                { _type: 'span', marks: [], text: " Proactive fortress. We audit smart contracts pre-listing, use AI for fraud detection (flagging 99.9% of suspicious trades), and educate via \"Project Guardian.\" Scams hurt us all—our $1 billion SAFU fund covers losses. Trust is our moat: 250 million users because they sleep easy." }
            ]
        },
        // Q10
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Three bets defining Binance's 2030?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Yi He:' },
                { _type: 'span', marks: [], text: " " }
            ]
        },
        {
            _type: 'block',
            listItem: 'number',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "Tokenized assets hit $10 trillion—Binance as the liquidity layer." }
            ]
        },
        {
            _type: 'block',
            listItem: 'number',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "Web3 wallets replace banks for 1 billion in emerging markets." }
            ]
        },
        {
            _type: 'block',
            listItem: 'number',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "AI + crypto unlocks personalized finance, like predictive yields." }
            ]
        },
        // Q11
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Final insight for leaders in volatile industries?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Yi He:' },
                { _type: 'span', marks: [], text: " Embrace the unknown. No one's successful alone—build teams that challenge you. Crypto taught me: Obstacles are invitations to innovate. Stay user-first, and the path clears." }
            ]
        },
        // Closing
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Thank you, Yi." }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Yi He:' },
                { _type: 'span', marks: [], text: " Thank you. To the future." }
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
            { _type: 'reference', _ref: 'category-innovation' } // Crypto/Web3 fits Innovation
        ]
    }

    // Fetch category ID for 'Innovation'
    const category = await client.fetch(`*[_type == "category" && title == "Innovation"][0]`)
    if (category) {
        doc.categories = [{ _type: 'reference', _ref: category._id }]
    }

    try {
        const res = await client.create(doc)
        console.log(`Article created: ${res._id}`)

        // 4. Update Juggernauts Config Link and Title
        const config = await client.fetch(`*[_type == "industryJuggernautConfig"][0]`)
        if (config) {
            const newItems = config.items.map((item: any) => {
                // Check for 'He Xiaopeng' (the previous placeholder) OR 'Yi He' (if already updated)
                if (item.title === 'He Xiaopeng' || item.title === 'Yi He') {
                    return {
                        ...item,
                        title: 'Yi He', // Ensure title is correct
                        link: `/category/innovation/${slug}`
                    }
                }
                return item
            })

            await client.patch(config._id)
                .set({ items: newItems })
                .commit()
            console.log('Updated Juggernauts config link and title for Yi He.')
        }

    } catch (err) {
        console.error('Error creating article:', err)
    }
}

createYiHeArticle()
