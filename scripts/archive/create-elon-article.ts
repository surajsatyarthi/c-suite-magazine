import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

dotenv.config({ path: '.env.local' })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2024-02-05',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
})

async function createArticle() {
    // 1. Get dependencies (Writer, Category, Image)
    const writer = await client.fetch('*[_type == "writer"][0]._id')
    const category = await client.fetch('*[_type == "category"][0]._id')

    if (!writer || !category) {
        console.error('Could not find writer or category. Please ensure they exist.')
        return
    }

    // Upload a placeholder image (using one of the juggernauts images)
    const imagePath = path.join(process.cwd(), 'public/juggernauts/1.png')
    let imageAssetId = null
    if (fs.existsSync(imagePath)) {
        const buffer = fs.readFileSync(imagePath)
        const asset = await client.assets.upload('image', buffer, { filename: 'elon-placeholder.png' })
        imageAssetId = asset._id
    } else {
        console.warn('Placeholder image not found, skipping image upload.')
    }

    // 2. Construct Body
    const body = [
        {
            _type: 'block',
            style: 'normal',
            children: [
                {
                    _type: 'span',
                    marks: [],
                    text: "Inside Tesla’s massive Austin Gigafactory — a complex larger than the Pentagon and completed in under a year and a half — Elon Musk shared his unfiltered perspective on leadership, innovation, and the forces shaping the next century."
                }
            ]
        },
        // Q1
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: ' This facility itself is a statement on speed. What lesson should other leaders take from the way you drive execution?' }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Elon Musk:' },
                { _type: 'span', marks: [], text: ' Bureaucracy is the silent killer of great companies. When the mission is as big as sustainable energy or becoming a multi-planetary species, you can’t move at normal corporate speed. You pick aggressive targets, then systematically eliminate every friction point until the impossible becomes routine.' }
            ]
        },
        // Q2
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: ' X has become the dominant real-time information platform globally. How do you measure whether it’s actually succeeding?' }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Elon Musk:' },
                { _type: 'span', marks: [], text: ' The metric that matters is whether people close the app feeling informed rather than manipulated or exhausted. Before, the platform was controlled by a narrow ideological group. Now the full range of human opinion is visible, engagement is at record levels, and users tell us they regret less time spent.' }
            ]
        },
        // Q3
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: ' Many leaders worry that maximum openness invites toxicity. How do you keep the environment productive without heavy-handed control?' }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Elon Musk:' },
                { _type: 'span', marks: [], text: ' We follow one simple rule: if it’s legal in the country where the server sits, it stays up. Community Notes, transparent algorithms, and one-tap reporting handle the rest. Suppressing speech never made it go away — it just drove it underground. Sunlight and open debate are the only long-term disinfectants.' }
            ]
        },
        // Q4
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: ' You’ve argued that forced diversity outcomes can hurt performance. How do you build world-class teams in today’s environment?' }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Elon Musk:' },
                { _type: 'span', marks: [], text: ' Hire the single best person for every role — no exceptions, no quotas. Talent is universal; historic opportunity has not been. When you optimize purely for capability, you naturally end up with highly diverse, ultra-high-performing teams. Anything else is a tax on excellence.' }
            ]
        },
        // Q5
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: ' Large-scale organizations sometimes face cultural challenges as they grow. How do you maintain standards across 140,000+ people?' }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Elon Musk:' },
                { _type: 'span', marks: [], text: ' I spent years living on production lines during the toughest ramps. Leaders set culture by what they notice and what they tolerate. We investigate every credible claim instantly and act without hesitation. Scale doesn’t excuse mediocrity.' }
            ]
        },
        // Q6
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: ' Founder and CEO mental health is finally being talked about openly. You’ve been candid about using prescribed therapeutics. What’s your message to other high-intensity leaders?' }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Elon Musk:' },
                { _type: 'span', marks: [], text: ' If a legal, doctor-supervised tool keeps you operating at peak capacity, use it. Pretending you’re invincible is far more dangerous than any prescription. The job is brutal; honesty about that is a strength, not a weakness.' }
            ]
        },
        // Q7
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: ' Regulation is the top concern we hear in every boardroom. Where is government slowing America down the most right now?' }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Elon Musk:' },
                { _type: 'span', marks: [], text: ' Permitting and regulatory accumulation have become the biggest barriers to progress. Projects that should take months now take a decade. We need to protect safety and the environment, but everything else is negotiable. If we don’t dramatically streamline, we lose the century to nations that can still build.' }
            ]
        },
        // Q8
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: ' You’ve indicated you might back a candidate in the next cycle. What are the absolute must-haves for any leader to earn your support?' }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Elon Musk:' },
                { _type: 'span', marks: [], text: ' Clear commitment to merit, individual liberty, rapid clean-energy adoption without coercion, secure borders paired with massive legal high-skill immigration, and unbreakable defense of free expression. If someone is serious on those five, I’ll explain the reasoning in detail.' }
            ]
        },
        // Q9
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: ' You’ve described certain ideological trends as an existential risk. How do you explain that to fellow executives?' }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Elon Musk:' },
                { _type: 'span', marks: [], text: ' When ideology overrides evidence and physics, everything breaks — engineering decisions, hiring decisions, policy decisions. The ability to think critically and update beliefs based on data is the ultimate competitive advantage. Anything that erodes that is a threat at the civilizational level.' }
            ]
        },
        // Q10
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: ' There’s renewed global debate about taxing extreme wealth. How should founders and large shareholders think about their broader role?' }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Elon Musk:' },
                { _type: 'span', marks: [], text: ' The highest-return use of capital is building products that move humanity forward. Tesla has removed more emissions than any organization ever. SpaceX made space accessible. That leverage is orders of magnitude greater than writing checks. Over-tax success and you simply relocate the talent and the jobs.' }
            ]
        },
        // Q11
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: ' In late 2025, what actually keeps you awake?' }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Elon Musk:' },
                { _type: 'span', marks: [], text: ' Three issues, ranked:' }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            listItem: 'number',
            children: [{ _type: 'span', marks: [], text: 'Getting superintelligent AI right — everything else becomes irrelevant if we fail.' }]
        },
        {
            _type: 'block',
            style: 'normal',
            listItem: 'number',
            children: [{ _type: 'span', marks: [], text: 'Sustained fertility collapse — technology can’t fix an empty cradle.' }]
        },
        {
            _type: 'block',
            style: 'normal',
            listItem: 'number',
            children: [{ _type: 'span', marks: [], text: 'Erosion of core freedoms — once lost, they rarely come back.' }]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: 'Solve those and the future is unlimited. Fail at any one and we’re in deep trouble.' }
            ]
        },
        // Q12
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: ' One final piece of advice for every leader reading this?' }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Elon Musk:' },
                { _type: 'span', marks: [], text: ' Make something so undeniably great that customers line up for it, and treat your people like volunteers on the most important mission in history — because if you’re aiming high enough, that’s exactly what they are.' }
            ]
        },
        // Closing
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: ' Thank you for your time.' }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Elon Musk:' },
                { _type: 'span', marks: [], text: ' Let’s get to work.' }
            ]
        },
    ]

    // 3. Create Document
    const doc = {
        _type: 'post',
        title: 'Elon Musk: Building the Future at Civilization Scale',
        slug: { _type: 'slug', current: 'elon-musk-building-future-civilization-scale' },
        writer: { _type: 'reference', _ref: writer },
        categories: [{ _type: 'reference', _ref: category }],
        mainImage: imageAssetId ? {
            _type: 'image',
            asset: { _type: 'reference', _ref: imageAssetId },
            alt: 'Elon Musk'
        } : undefined,
        publishedAt: new Date().toISOString(),
        body: body,
        articleVariant: 'interview',
        tags: ['Leadership', 'Innovation', 'Future'],
        excerpt: 'Elon Musk shares his unfiltered perspective on leadership, innovation, and the forces shaping the next century in an exclusive interview.',
        readTime: 8,
        views: 1500000
    }

    try {
        const result = await client.create(doc)
        console.log('Successfully created article:', result._id)
    } catch (error) {
        console.error('Failed to create article:', error)
    }
}

createArticle()
