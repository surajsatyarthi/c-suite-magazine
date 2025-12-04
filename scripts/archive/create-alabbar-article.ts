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

async function createAlabbarArticle() {
    // 1. Get Image Asset
    const imagePath = path.join(process.cwd(), 'public/juggernauts/alabbar.png')
    let imageAssetId = null

    if (fs.existsSync(imagePath)) {
        console.log('Uploading image...')
        const buffer = fs.readFileSync(imagePath)
        const asset = await client.assets.upload('image', buffer, { filename: 'alabbar.png' })
        imageAssetId = asset._id
    } else {
        console.log('Image not found, skipping image upload.')
    }

    // 2. Define Content
    const title = "Mohamed Alabbar: Dubai's Master Builder and the Next Frontier of Urban Innovation"
    const slug = "mohamed-alabbar-dubai-master-builder-urban-innovation"
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
                { _type: 'span', marks: [], text: "Overlooking the glittering skyline from Emaar's Downtown Dubai offices—home to the Burj Khalifa and the world's most visited mall—Mohamed Alabbar reflects on a career that has redefined skylines and economies. At 64, the founder of Emaar Properties and Noon.com has orchestrated $350 billion in developments across 18 countries, from Madagascar's beaches to Riyadh's factories. This dialogue captures his unyielding drive to blend ambition with accountability in a world demanding sustainable growth." }
            ]
        },
        // Q1
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You founded Emaar in 1997 with a vision to modernize Dubai. Nearly three decades later, it's a global powerhouse. What timeless principle has kept the momentum alive?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Mohamed Alabbar:' },
                { _type: 'span', marks: [], text: " Vision without execution is hallucination. We started with a simple mandate: Build cities that inspire and sustain. Downtown Dubai wasn't just towers; it was an ecosystem—retail, residences, entertainment—creating 5% of the emirate's GDP alone. The principle? Obsess over quality and user experience. Every project must add lasting value, not temporary buzz." }
            ]
        },
        // Q2
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Dubai Mall draws 150 million visitors yearly, making it Earth's most visited destination. You're pushing for 200 million with content creators. How do you leverage digital natives in real estate?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Mohamed Alabbar:' },
                { _type: 'span', marks: [], text: " Content is the new concrete. Traditional ads are dead; we need authentic stories that pull people in. At the 1 Billion Followers Summit, I challenged creators: Give me a killer idea to promote Dubai, and I'll sign the check. It's not charity—it's collaboration. Dubai Mall thrives because it's shareable: Fireworks, aquariums, fashion weeks. Creators amplify that exponentially, turning visitors into advocates." }
            ]
        },
        // Q3
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You famously let go of your entire marketing team at Noon because they couldn't tie spend to sales. What does that say about measuring impact in 2025?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Mohamed Alabbar:' },
                { _type: 'span', marks: [], text: " Marketing without metrics is madness. At Noon, we were burning cash on campaigns that didn't move the needle. I demanded: Show me how every dirham drives revenue. They couldn't, so out they went. Today, everything's data-first—AI tracks ROI in real-time. For Emaar, it's the same: Does this campaign fill hotels or sell units? If not, pivot or perish. Focus on what sells, not what shines." }
            ]
        },
        // Q4
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Dubai Square Mall, your $49 billion behemoth, opens in three years—three times Downtown's size, with indoor EV charging. How does it future-proof retail amid e-commerce dominance?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Mohamed Alabbar:' },
                { _type: 'span', marks: [], text: " Retail isn't dying; it's evolving into experiences. Dubai Square isn't a mall; it's a lifestyle ecosystem—shops, theaters, green spaces—for 100 million annual visitors. EVs inside? That's Dubai's green pledge: Seamless charging to make sustainability effortless. We've got 15 years of intel from Dubai Mall; now we scale it smarter, with retailers co-designing for relevance. E-commerce complements; we capture the moments it can't." }
            ]
        },
        // Q5
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You're expanding into emerging markets like Madagascar with a $1 billion+ mega-project. What draws you to untapped frontiers over saturated ones?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Mohamed Alabbar:' },
                { _type: 'span', marks: [], text: " Opportunity hides in the overlooked. Madagascar's fourth-most-beautiful island? Pristine potential for eco-tourism and resorts that preserve as they prosper. We've done Egypt's Marassi Bay ($17 billion JV) and eyed India, China—places hungry for iconic developments. Risk? High. But Dubai was a desert dream once. I chase where vision meets viability: Strong partners, local impact, 15-20% returns." }
            ]
        },
        // Q6
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " On Gaza reconstruction, you've said, \"Everybody should clean up their garbage.\" As a builder of nations, how do you weigh ethics against opportunity?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Mohamed Alabbar:' },
                { _type: 'span', marks: [], text: " Accountability first. We've not been approached for Gaza, and frankly, we wouldn't lead it—those who broke it should fix it. My focus: Projects that unite, not divide. Emaar's in stable growth corridors—Saudi's $100 million Riyadh plant with Americana, UAE's urban renewal. Ethics isn't avoidance; it's choosing fights that build peace through prosperity." }
            ]
        },
        // Q7
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " You've urged UAE entrepreneurs to pivot to manufacturing, calling it the next GDP driver. Why industry over apps in a tech-saturated world?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Mohamed Alabbar:' },
                { _type: 'span', marks: [], text: " Apps are oxygen; factories are the lungs. UAE's manufacturing is 15% of GDP now—we can double it with discipline and integrity. At Sharjah's Investment Forum, I told the next gen: Build things that employ thousands, export globally. My poverty-rooted drive? Overcome scarcity by creating abundance. Noon taught e-commerce; Eagle Hills, real assets. Industry scales nations—focus there for real legacy." }
            ]
        },
        // Q8
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Talent development is core—Emirati skill-building in Dubai Square, mentorship across ventures. How do you cultivate leaders in hyper-growth?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Mohamed Alabbar:' },
                { _type: 'span', marks: [], text: " Hands-on immersion. Young Emiratis rotate through sites, learning from blueprint to handover. I mentor personally: Share failures, like early Emaar setbacks, to build grit. Retention? Purpose plus equity—they own the wins. In a talent war, we win by investing in people as assets, not costs. Every project trains 1,000+ locals; that's our moat." }
            ]
        },
        // Q9
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Noon's e-commerce empire and Emaar's hospitality arm face global headwinds. How do you allocate amid volatility?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Mohamed Alabbar:' },
                { _type: 'span', marks: [], text: " Diversified discipline: 60% core real estate, 20% tech/retail, 20% emerging bets. We model scenarios—oil dips, recessions—and stress-test for 12%+ IRR. Flexibility rules: Pause non-essentials if yields slip. 2025's $60 billion pipeline? Prioritize high-conviction plays like Riyadh expansions. Returns guide; resilience endures." }
            ]
        },
        // Q10
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Three non-negotiables shaping your next decade?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Mohamed Alabbar:' },
                { _type: 'span', marks: [], text: " " }
            ]
        },
        {
            _type: 'block',
            listItem: 'number',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "Integrity—every deal clean, every promise kept." }
            ]
        },
        {
            _type: 'block',
            listItem: 'number',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "Innovation—blend tech with timeless design for experiential edges." }
            ]
        },
        {
            _type: 'block',
            listItem: 'number',
            style: 'normal',
            children: [
                { _type: 'span', marks: [], text: "Impact—5% GDP uplift per project, jobs for generations." }
            ]
        },
        // Q11
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Final counsel for builders in uncertain times?" }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Mohamed Alabbar:' },
                { _type: 'span', marks: [], text: " Dream audaciously, execute meticulously. Poverty taught me: Opportunity favors the prepared. Align vision with value—build what lasts, and wealth follows." }
            ]
        },
        // Closing
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'CSuite:' },
                { _type: 'span', marks: [], text: " Thank you, Mohamed." }
            ]
        },
        {
            _type: 'block',
            style: 'normal',
            children: [
                { _type: 'span', marks: ['strong'], text: 'Mohamed Alabbar:' },
                { _type: 'span', marks: [], text: " The journey continues. Let's shape tomorrow." }
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
                if (item.title === 'Mohamed Alabbar') {
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
            console.log('Updated Juggernauts config link for Mohamed Alabbar.')
        }

    } catch (err) {
        console.error('Error creating article:', err)
    }
}

createAlabbarArticle()
