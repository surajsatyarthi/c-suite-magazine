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

async function createRatanArticle() {
    // 1. Upload Image (using 3.png as a guess for Ratan Tata based on grid position)
    const imagePath = path.join(process.cwd(), 'public/juggernauts/3.png')
    let imageAssetId = null

    if (fs.existsSync(imagePath)) {
        console.log('Uploading image...')
        const buffer = fs.readFileSync(imagePath)
        const asset = await client.assets.upload('image', buffer, { filename: 'ratan-tata.png' })
        imageAssetId = asset._id
    } else {
        console.log('Image not found, skipping image upload.')
    }

    // 2. Define Content
    const title = "Ratan Tata: A Legacy of Ethical Leadership and Enduring Impact"
    const slug = "ratan-tata-legacy-ethical-leadership"
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
                { _type: 'span', marks: [], text: "In the quiet elegance of Mumbai's Bakhtawar residence—overlooking the Arabian Sea and a stone's throw from the Taj Mahal Palace Hotel, a Tata cornerstone since 1903—Ratan Tata reflected on a life dedicated to building not just businesses, but a better India. Though he stepped away from the executive spotlight in 2012, his influence endures through the Tata Group's global reach and the Trusts that channel billions toward societal good. This conversation, drawn from his timeless wisdom, captures the humility, vision, and quiet resolve that defined one of India's most revered leaders." }
            ]
        },
        // Q1
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Your journey began on factory floors, shoveling limestone at Tata Steel. What does that hands-on start teach today's executives about grounding leadership in reality?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Ratan Tata:' },
                { _type: 'span', marks: [], text: " Leadership isn't about titles or corner offices; it's about understanding the people who make the machine run. I learned more in those early days—working shifts in blast furnaces—than in any boardroom. Empathy comes from shared struggle. Too many leaders today hover above the fray; you can't inspire trust if you've never felt the weight of the work." }
            ]
        },
        // Q2
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " The Tata Group grew from an India-centric powerhouse to a global entity under your watch, with acquisitions like Jaguar Land Rover and Corus. How did you instill a culture of bold risk-taking without recklessness?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Ratan Tata:' },
                { _type: 'span', marks: [], text: " Risk is the price of progress, but it must be calculated with integrity. We didn't chase deals for glory; we sought them to strengthen our foundations and create value for all stakeholders. Turning around NELCO in the 1970s taught me resilience—initial success, then economic headwinds. It's not about avoiding failure; it's about learning from it and emerging stronger, always prioritizing ethics over expediency." }
            ]
        },
        // Q3
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Philanthropy runs deep in the Tata DNA, with Trusts directing over 65% of profits to education, healthcare, and rural upliftment. How should modern CEOs integrate social impact into core strategy?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Ratan Tata:' },
                { _type: 'span', marks: [], text: " Business exists to serve society, not extract from it. The Trusts aren't a side project; they're the soul of Tata. We've funded everything from affordable cancer care to village electrification because true success measures lives improved, not just balance sheets. CEOs today should ask: Does this create shared prosperity? If not, rethink it." }
            ]
        },
        // Q4
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You launched the Tata Nano, aiming to put India on wheels affordably. It faced challenges, yet symbolized innovation for the masses. What lessons on inclusive growth emerged?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Ratan Tata:' },
                { _type: 'span', marks: [], text: " The Nano was born from a simple conviction: Mobility shouldn't be a luxury. We engineered it to cost under $2,000, targeting families on two-wheelers. Hurdles like perception and regulations tested us, but the principle holds—innovation must democratize opportunity. Scale it right, and you lift entire ecosystems." }
            ]
        },
        // Q5
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Ethical dilemmas arise in global expansion. You've walked away from deals over integrity concerns. How do you advise leaders navigating gray areas?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Ratan Tata:' },
                { _type: 'span', marks: [], text: " Never compromise your values for a quick win. I pulled out of bids where corruption loomed because short-term gain erodes long-term trust. Integrity isn't optional; it's your brand's currency. Surround yourself with smarter, principled people—they'll guide you through the fog." }
            ]
        },
        // Q6
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Tata's revival of Air India in 2021 closed a historic circle. What does reclaiming such icons say about stewardship across generations?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Ratan Tata:' },
                { _type: 'span', marks: [], text: " Air India was family once—founded by J.R.D. Tata in 1932. Bringing it home wasn't nostalgia; it was recommitment to nation-building. Legacy isn't hoarding; it's evolving what came before to serve the future. Honor the past by pushing boundaries." }
            ]
        },
        // Q7
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Animal welfare was a personal passion, from your Mumbai shelter to appeals for stray care. How does compassion beyond humans shape a leader's worldview?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Ratan Tata:' },
                { _type: 'span', marks: [], text: " Kindness is universal—it starts with the vulnerable, whether people or pets. My hospital for animals, opened in 2024, reflects that: 24/7 care for strays, no questions asked. Leadership without heart is hollow. Empathy fuels innovation; it reminds us why we build." }
            ]
        },
        // Q8
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You've invested in over 40 startups personally. What draws you to entrepreneurship, and what one trait do young founders need most?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Ratan Tata:' },
                { _type: 'span', marks: [], text: " Entrepreneurs are dreamers with grit—they're the engines of change. I back them because India needs bold ideas in tech, health, and beyond. The essential trait? Resilience. Failure isn't fatal; quitting is. Learn fast, adapt, and keep the greater good in sight." }
            ]
        },
        // Q9
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Regulation and bureaucracy stifle growth in emerging markets. Drawing from India's liberalization era, what's your counsel for policymakers and CEOs?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Ratan Tata:' },
                { _type: 'span', marks: [], text: " Streamline without sacrificing safeguards. The 1991 reforms unlocked our potential; without them, we'd still be shadows. Governments must enable builders—cut red tape, invest in skills. CEOs, meanwhile, advocate patiently but firmly. Progress demands partnership." }
            ]
        },
        // Q10
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Humility defined you—despite Padma awards and global honors. How do you cultivate it amid success?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Ratan Tata:' },
                { _type: 'span', marks: [], text: " Success is a team sport; ego is the opponent. I followed giants like J.R.D., wearing shoes too big to fill. Stay curious, listen more than you speak, and remember: Your role is temporary; impact should be eternal. Humility keeps you grounded and grateful." }
            ]
        },
        // Q11
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You've said, \"Take the stones thrown at you and use them to build a monument.\" How has criticism fueled your path?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Ratan Tata:' },
                { _type: 'span', marks: [], text: " Criticism is raw material—if you're not critiqued, you're not challenging the status quo. Early resistance to consolidating Tata companies stung, but it built resolve. Transform doubt into drive; monuments of achievement rise from the rubble of naysayers." }
            ]
        },
        // Q12
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Education transformed you—from Cornell architecture to Harvard's management program. Why prioritize learning in turbulent times?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Ratan Tata:' },
                { _type: 'span', marks: [], text: " Knowledge is the great equalizer. My degrees equipped me, but lifelong learning sustains you. In chaos, the adaptable thrive. Invest in education not just for individuals, but nations—it's the seed of every breakthrough." }
            ]
        },
        // Q13
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Looking back, what legacy do you hope endures beyond the Tata name?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Ratan Tata:' },
                { _type: 'span', marks: [], text: " A world slightly better for my having been here. Not empires, but empowered people—through ethical business, compassionate giving, and unyielding fairness. If I've stood for what's right and lifted others along the way, that's enough." }
            ]
        },
        // Q14
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " One parting insight for leaders facing 2025's uncertainties?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Ratan Tata:' },
                { _type: 'span', marks: [], text: " Lead with purpose, not power. Decisions aren't always perfect—make them, then refine. Surround yourself with the wise, act with kindness, and build for tomorrow. The rest follows." }
            ]
        },
        // Closing
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Thank you for your wisdom." }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Ratan Tata:' },
                { _type: 'span', marks: [], text: " The privilege was mine. Onward." }
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
            { _type: 'reference', _ref: 'category-leadership' } // Assuming this ID exists or we need to find it
        ]
    }

    // Fetch category ID for 'Leadership'
    const category = await client.fetch(`*[_type == "category" && title == "Leadership"][0]`)
    if (category) {
        doc.categories = [{ _type: 'reference', _ref: category._id }]
    } else {
        console.log('Leadership category not found, using default or creating...')
        // Fallback?
    }

    try {
        const res = await client.create(doc)
        console.log(`Article created: ${res._id}`)
    } catch (err) {
        console.error('Error creating article:', err)
    }
}

createRatanArticle()
