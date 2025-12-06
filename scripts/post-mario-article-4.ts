
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

const ARTICLE = {
    title: "The CEO’s Dilemma: Balancing Hyper-Growth with Human-Centric Leadership",
    slug: { current: "ceos-dilemma-balancing-hyper-growth-human-centric-leadership" },
    writerId: "506cbd64-f67d-4e57-9ee4-c509afdf2e41", // Mario Armstong
    imageId: "image-0008b5d937815be0dc78258167c484242e86c9c8-1200x800-jpg", // Placeholder
    publishedAt: new Date().toISOString(),
    body: [
        {
            _type: 'block',
            style: 'normal',
            children: [
                {
                    _type: 'span',
                    text: "In the C-suite, we live in a dichotomy. The market demands hyper-growth—quarter over quarter, year over year. Yet, the engine of that growth—our people—demands sustainability, purpose, and balance. This is the defining tension of modern leadership: How do you push for record-breaking performance without breaking your workforce?"
                }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                {
                    _type: 'span',
                    text: "The old playbook of 'churn and burn' is obsolete. In a talent-constrained economy, human-centric leadership isn't a 'nice-to-have'; it's a risk management strategy."
                }
            ]
        },
        {
            _type: 'block',
            style: 'h3',
            children: [{ _type: 'span', text: "The Fallacy of 'Either/Or'" }]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                {
                    _type: 'span',
                    text: "Too many leaders view this as a binary choice: either we are ruthless capitalists or we are compassionate communes. This is a false dilemma. The most value-generative companies of the next decade will be those that master the 'And'. They will drive aggressive KPIs *and* prioritize mental health. They will demand excellence *and* offer flexibility."
                }
            ]
        },
        {
            _type: 'block',
            style: 'h3',
            children: [{ _type: 'span', text: "Sustainable Intensity" }]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                {
                    _type: 'span',
                    text: "High performance requires intensity, but biological systems (humans) cannot sustain peak intensity indefinitely. The CEO's job is to architect 'sustainable intensity'. This means building recovery periods into the corporate calendar, celebrating rest as a performance enhancer, and recognizing that 80 hours of burnout work is worth less than 40 hours of flow state work."
                }
            ]
        },
        {
            _type: 'block',
            style: 'h3',
            children: [{ _type: 'span', text: "Purpose as a Performance Drug" }]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                {
                    _type: 'span',
                    text: "You cannot pay people enough to care about 20% EBITDA growth. To unleash discretionary effort—that magic extra mile employees go when no one is watching—you must connect the hyper-growth to a human mission. People will burn themselves out for a number; they will light themselves up for a cause. If your growth narrative doesn't have a human impact chapter, rewrite it."
                }
            ]
        },
        {
            _type: 'block',
            style: 'h3',
            children: [{ _type: 'span', text: "The Metrics That Matter" }]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                {
                    _type: 'span',
                    text: "We manage what we measure. Every boardroom looks at revenue and margin. How many look at 'burnout risk' or 'psychological safety index' with the same rigor? If human capital is truly your greatest asset, your dashboard should reflect its depreciation. Ignoring these signals until turnover spikes is like ignoring a check engine light until the car explodes."
                }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                {
                    _type: 'span',
                    text: "The path to 10x growth isn't through squeezing more juice out of the orange. It's through planting a better orchard. The CEO who solves the dilemma of balancing growth with humanity doesn't just win the quarter; they win the decade."
                }
            ]
        }
    ]
}

async function createGuestArticle() {
    console.log(`Creating article: ${ARTICLE.title}`)

    const category = await client.fetch(`*[_type == "category" && title match "Business"][0]`) ||
        await client.fetch(`*[_type == "category" && title match "Leadership"][0]`) ||
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
