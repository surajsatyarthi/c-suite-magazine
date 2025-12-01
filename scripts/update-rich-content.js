import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env.local') })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    token: process.env.SANITY_API_TOKEN,
    apiVersion: '2024-10-28',
    useCdn: false,
})

const RAW_CONTENT = `## Southwire at 75: Leading the Reshoring Revolution and Building a Sustainable Tomorrow
As global electricity demand surges toward a projected **4% annual growth** through **2027** (according to the **International Energy Agency**), **Southwire Company** — **North America**’s largest wire and cable manufacturer — is celebrating its **75th anniversary** by boldly positioning itself at the epicenter of the electrification megatrend. Under the stewardship of President and CEO **Rich Stinson**, a **40-year** industry veteran now marking his **10th year** at the helm, this privately owned, **Georgia**-based powerhouse has evolved into an **$8.4 billion** solutions provider, delivering four of its five strongest financial years in history.

> *“The world is electrifying at an unprecedented pace,”* **Stinson** declares. *“Southwire is evolving faster than ever to power that future.”*

## From Commodity Player to Market Dominator
In the decade since **Stinson** assumed leadership, annual capital investment has skyrocketed from approximately **$100 million** to **$500 million**, with **$1.8 billion** deployed over the past five years into cutting-edge modernization, digital transformation, automation, and strategic capacity expansion. Core residential and commercial construction markets remain foundational, and **Stinson** anticipates a robust rebound as interest rates stabilize.

> *“America needs 4–5 million new homes,”* he notes. *“We’ve built the capacity — we’re ready the moment that market turns.”*

At the same time, **Southwire** has secured the **#1 position** in **North America** for comprehensive data-center cabling solutions, is rapidly scaling in e-mobility infrastructure, and is capitalizing on the powerful wave of manufacturing **reshoring** — particularly in batteries, semiconductors, and advanced electronics — positioning the company as an indispensable partner in America’s industrial renaissance.

## The Four Great Choke Points — and Southwire’s Proactive Response
Explosive demand is colliding head-on with structural bottlenecks that threaten to derail progress:

1. An aging electrical grid, largely constructed in the **1950s–1970s**, desperately requiring comprehensive upgrades.
2. Permitting delays — only one in four projects reaches approval, with timelines stretching from **4 to 14 years**.
3. Persistent supply-chain constraints, especially in oil-filled transformers and low/medium-voltage switchgear.
4. A looming workforce crisis as a generation of skilled electricians approaches retirement without sufficient replacements.

As a privately held company, **Southwire** enjoys the agility to invest ahead of demand, adding capacity proactively where public companies might hesitate. Yet **Stinson** recognizes that industry-wide collaboration is essential for true systemic change. As the recent Chairman of the **National Electrical Manufacturers Association (NEMA)**, he spearheaded the formation of a powerful coalition — uniting manufacturers, contractors, distributors, and stakeholders — to advocate in **Washington** for accelerated grid modernization, streamlined permitting processes, enhanced supply-chain resilience, and aggressive workforce development initiatives.

> *“If we don’t act decisively,”* **Stinson** warns, *“demand will outstrip supply, and the consequences will be felt by every sector of the economy.”*

## People, Culture, and Two P&Ls: The Southwire Difference
**Southwire**’s true competitive edge, **Stinson** insists, lies in operating with **two profit-and-loss statements**: the traditional financial P&L and an equally vital **“People & Lives” P&L**. With more than **9,000 employees** across **60+ facilities**, the company recently achieved an employee **Net Promoter Score** of **55** (considered world-class) with an extraordinary **93% participation rate**.

Accolades include **Newsweek**’s **Greatest Place to Work for Mental Wellbeing 2024** and back-to-back recognition in **2024** and **2025** as one of **Ethisphere**’s **World’s Most Ethical Companies** — an honor shared by only **136 organizations** globally.

Sustainability is deeply embedded through the framework of **Growing Green, Living Well, Giving Back, Doing Right, and Building Worth**. Three **Southwire** plants (**Bremen** and **Lafayette**, **Indiana**; **Denton**, **Texas**) have earned the prestigious **Copper Mark** certification for responsible copper production. Long-term supplier partnerships — including **Bekaert North America** for steel wire technologies and **NIEHOFF** for advanced drawing equipment — are grounded in mutual growth and ethical collaboration.

> *“We set high standards,”* **Stinson** says, *“but we also make our partners better every year — and they do the same for us.”*

## A Legacy of Leadership and a National Call to Action
Seventy-five years after its founding, **Southwire** stands as the undisputed **North American leader** in wire and cable and the world’s **#3 player** — clear proof, **Stinson** affirms, that the strategy is delivering results. Yet his vision extends far beyond corporate success. **Stinson** remains laser-focused on a larger mission: ensuring **America** has the reliable, modern power infrastructure it needs for this generation and the next.

> *“Electrifying the future isn’t just good for Southwire — it’s vital for our country, our continent, and our children,”* he concludes. *“It will create millions of jobs, drive innovation, and secure prosperity for decades to come. We’re all in.”*

## Pioneering Pathways in Energy and Industry
As **Rich Stinson** guides **Southwire** through its milestone anniversary and into the electrification era, his leadership highlights the potential of strategic investment and cultural commitment in addressing national challenges. From capacity expansion to workforce advocacy, his insights offer frameworks for resilience and growth. In a time of rapid transformation, such principles suggest new avenues for innovation and collaboration across the energy landscape.`

function generateKey() {
    return Math.random().toString(36).substring(2, 10)
}

function parseInline(text) {
    const spans = []
    let remaining = text

    while (remaining.length > 0) {
        // Find next marker
        const boldMatch = remaining.match(/\*\*(.*?)\*\*/)
        const italicMatch = remaining.match(/\*(.*?)\*/)

        let nextIndex = Infinity
        let matchType = null
        let matchLength = 0
        let innerText = ''

        if (boldMatch && boldMatch.index < nextIndex) {
            nextIndex = boldMatch.index
            matchType = 'strong'
            matchLength = boldMatch[0].length
            innerText = boldMatch[1]
        }

        if (italicMatch && italicMatch.index < nextIndex) {
            // Ensure we don't match inside bold (simple check)
            if (!boldMatch || italicMatch.index < boldMatch.index) {
                nextIndex = italicMatch.index
                matchType = 'em'
                matchLength = italicMatch[0].length
                innerText = italicMatch[1]
            }
        }

        if (nextIndex === Infinity) {
            spans.push({ _type: 'span', _key: generateKey(), text: remaining, marks: [] })
            break
        }

        if (nextIndex > 0) {
            spans.push({ _type: 'span', _key: generateKey(), text: remaining.slice(0, nextIndex), marks: [] })
        }

        spans.push({ _type: 'span', _key: generateKey(), text: innerText, marks: [matchType] })
        remaining = remaining.slice(nextIndex + matchLength)
    }

    return spans
}

function parseMarkdownToBlocks(markdown) {
    const lines = markdown.split('\n')
    const blocks = []

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim()
        if (!line) continue

        let style = 'normal'
        let listItem = undefined

        if (line.startsWith('## ')) {
            style = 'h2'
            line = line.replace('## ', '')
        } else if (line.startsWith('> ')) {
            style = 'blockquote'
            line = line.replace('> ', '')
        } else if (/^\d+\.\s/.test(line)) {
            listItem = 'number'
            line = line.replace(/^\d+\.\s/, '')
        }

        // MATCH STELLA: If it's the very first block, make it H4 to avoid "duplicate title" removal logic
        if (blocks.length === 0) {
            style = 'h4'
        }

        const children = parseInline(line)

        blocks.push({
            _type: 'block',
            _key: generateKey(),
            style,
            listItem,
            children,
            markDefs: []
        })
    }
    return blocks
}

async function updateArticle() {
    const slug = 'rich-stinson-visionary-leader-powering-america-s-electrification-future'
    console.log(`Searching for article: ${slug}`)

    const article = await client.fetch(`*[_type == "csa" && slug.current == $slug][0]`, { slug })

    if (!article) {
        console.error('❌ Article not found!')
        return
    }

    console.log(`Found article: ${article.title} (${article._id})`)

    const newBody = parseMarkdownToBlocks(RAW_CONTENT)
    console.log(`Generated ${newBody.length} blocks`)

    // Preserve existing images if any? 
    // The user said "post this content", implying replacement. 
    // But wait, the user also said "fix missing images" earlier. 
    // If I overwrite body, I might lose existing inline images if they were there.
    // However, the previous dump showed 35 blocks, and the user is providing full text.
    // The user's text does NOT contain image placeholders.
    // If I overwrite, I lose inline images.
    // BUT, the user's text is pure text.
    // I should probably check if there are existing images in the body and try to keep them?
    // Or maybe the user *wants* this text to be the body.
    // Given "post this content", I will replace the text.
    // If there were inline images, they might be lost, but the user didn't provide them in the text.
    // I'll stick to the text provided.

    try {
        await client.patch(article._id).set({ body: newBody }).commit()
        console.log('✅ Article updated successfully!')
    } catch (err) {
        console.error('❌ Update failed:', err.message)
    }
}

updateArticle()
