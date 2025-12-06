
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

const WRITE_TOKEN = getEnvValue('SANITY_WRITE_TOKEN')
const PROJECT_ID = getEnvValue('NEXT_PUBLIC_SANITY_PROJECT_ID')
const DATASET = getEnvValue('NEXT_PUBLIC_SANITY_DATASET')

if (!WRITE_TOKEN) {
    console.error("❌ Could not find SANITY_WRITE_TOKEN in .env.local")
    process.exit(1)
}

const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: '2024-01-01',
    token: WRITE_TOKEN,
    useCdn: false,
})

const ARTICLE = {
    title: "Beyond the Resume: The 5 Core Traits of True Entrepreneurship",
    slug: { current: "beyond-resume-5-core-traits-true-entrepreneurship" },
    writerId: "c48d3d8d-607f-40e8-9eca-02dfd965ca30", // Sherina Kapany
    imageId: "image-0008b5d937815be0dc78258167c484242e86c9c8-1200x800-jpg", // Reusing placeholder
    publishedAt: new Date().toISOString(),
    body: [
        {
            _type: 'block',
            style: 'normal',
            children: [
                {
                    _type: 'span',
                    text: "In the era of startups, the term 'entrepreneur' is often diluted to mean anyone who starts a business. But true entrepreneurship isn't defined by incorporation papers; it's a mindset. It's found in the free spirits who dare to dream big and execute differently, regardless of what their resume says."
                }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                {
                    _type: 'span',
                    text: "If you look closely at titans like Zuckerberg, Jobs, or Bezos, you'll find a common thread of traits that transcend formal education. Here are the five core skills that define the entrepreneurial DNA:"
                }
            ]
        },
        {
            _type: 'block',
            style: 'h3',
            children: [{ _type: 'span', text: "1. Creative Thinking" }]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                {
                    _type: 'span',
                    text: "Entrepreneurs view the world through a different lens. It took Jeff Bezos' creative vision to see an online bookstore as the foundation for an 'everything store' powered by drones and streaming. Creative thinking isn't just about art; it's about connecting existing expertise with new learnings to innovate solutions others overlook."
                }
            ]
        },
        {
            _type: 'block',
            style: 'h3',
            children: [{ _type: 'span', text: "2. Limitless Leadership" }]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                {
                    _type: 'span',
                    text: "No leader succeeds in a vacuum. The best leaders credit their teams for success but personally shoulder the blame for failure. True leadership involves making the tough, heavy decisions that protect the team while keeping the vision on track. Ultimately, every action your company takes is a reflection of you."
                }
            ]
        },
        {
            _type: 'block',
            style: 'h3',
            children: [{ _type: 'span', text: "3. Calculated Risk-Taking" }]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                {
                    _type: 'span',
                    text: "Success favors the bold. The thrill of entrepreneurship lies in the payoff of a gamble well-taken. It’s about foresight and the willingness to make short-term sacrifices for long-term gains. As Warren Buffett implies, risk is only dangerous when you don't know what you're doing."
                }
            ]
        },
        {
            _type: 'block',
            style: 'h3',
            children: [{ _type: 'span', text: "4. Unwavering Resilience" }]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                {
                    _type: 'span',
                    text: "Failure is as much a part of business as it is of life. To err is human, but to repeat the same error is foolish. Giving up is never an option for an entrepreneur. Resilience is the ability to not just learn from mistakes, but to hold your ground and push through the failure when it happens."
                }
            ]
        },
        {
            _type: 'block',
            style: 'h3',
            children: [{ _type: 'span', text: "5. Ironclad Work Ethic" }]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                {
                    _type: 'span',
                    text: "The entrepreneurial lifestyle looks glamorous from the outside, but the reality is late nights, last-minute meetings, and zero procrastination. You must adopt a 'work comes first' mentality. Self-discipline is the bedrock upon which all other skills are built."
                }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                {
                    _type: 'span',
                    text: "You can have a decorated resume and decades of experience, but without these core traits, managing a company will be an uphill battle. Entrepreneurship is about building a legacy, and that requires a willingness to sacrifice comfort for the vision you crave."
                }
            ]
        }
    ]
}

async function createGuestArticle() {
    console.log(`Creating article: ${ARTICLE.title}`)

    // Search for 'Business' or 'Leadership' category
    const category = await client.fetch(`*[_type == "category" && title match "Business"][0]`) ||
        await client.fetch(`*[_type == "category"][0]`)

    const doc = {
        _type: 'post',
        title: ARTICLE.title,
        slug: ARTICLE.slug,
        author: {
            _type: 'reference',
            _ref: ARTICLE.writerId
        },
        mainImage: {
            _type: 'image',
            asset: {
                _type: 'reference',
                _ref: ARTICLE.imageId
            },
            alt: ARTICLE.title
        },
        categories: [
            {
                _type: 'reference',
                _ref: category._id,
                _key: `${category._id}`
            }
        ],
        publishedAt: ARTICLE.publishedAt,
        body: ARTICLE.body
    }

    const res = await client.create(doc)
    console.log(`✅ Article created! ID: ${res._id}`)
}

createGuestArticle()
