const { createClient } = require('@sanity/client')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '2f93fcy8',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    useCdn: false,
    token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
})

async function expandArticle() {
    console.log('--- Expanding Article Content ---')
    
    // Original intro kept, but slightly enriched.
    // Added: "The Battle for North America", "The Architecture of Trust", "The ROI of Risk"
    
    const body = [
        {
            "_type": "block",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "text": "As global electricity demand surges toward a projected 4% annual growth through 2027 (according to the International Energy Agency), the digital current powering the world’s small business economy is accelerating even faster. At the helm of this transformation is Sukhinder Singh Cassidy, the CEO of Xero, a battle-tested tech veteran from Google and StubHub who is now steering a $20 billion ecosystem."
                }
            ]
        },
        {
            "_type": "block",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "text": "Serving a global community of more than 4.6 million subscribers, Xero is no longer just accounting software; it is the financial operating system for the engine room of the global economy. From coffee shops in Melbourne to design agencies in London and construction firms in Texas, the platform has become the silent partner in millions of success stories."
                }
            ]
        },
        {
            "_type": "block",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "text": "\"The velocity of change in 2026 is unlike anything we’ve seen,\" Cassidy notes, leaning forward with the intensity that has defined her career. \"Small businesses are facing a triple threat: sticky inflation, chronic labor shortages, and the urgent, non-negotiable need to digitize back-office operations. Our job isn't just to help them survive it, but to give them the tools to thrive in it.\""
                }
            ]
        },
        {
            "_type": "block",
            "style": "blockquote",
            "children": [
                {
                    "_type": "span",
                    "text": "\"Our job isn't just to help them survive it, but to give them the tools to thrive in it.\""
                }
            ]
        },
        {
            "_type": "block",
            "style": "h2",
            "children": [{ "_type": "span", "text": "Win the 3x3: A Strategy of Precision" }]
        },
        {
            "_type": "block",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "text": "Upon taking the reins, Cassidy dispensed with the broad, scattered growth strategies of the past. Her vision for 2026 is disciplined and ruthless, known internally as \"Win the 3x3.\" It focuses on winning in three critical markets—Australia, the UK, and the US—across three critical jobs: accounting, payroll, and payments."
                }
            ]
        },
        {
            "_type": "block",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "text": "This narrowing of focus was a calculated gamble, but it has paid off. By divesting from peripheral projects and doubling down on the core, Xero has increased its rate of innovation. \"We aren't just trying to be everywhere; we are trying to be _everything_ to the markets that matter most,\" she explains. \"In software, specificity is the key to velocity.\""
                }
            ]
        },
        {
            "_type": "block",
            "style": "h2",
            "children": [{ "_type": "span", "text": "The Battle for North America" }]
        },
        {
            "_type": "block",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "text": "The centerpiece of this strategy is Xero’s aggressive push into the United States—a market long dominated by entrenched giant Intuit (QuickBooks). For years, Xero played the role of the polite challenger. Under Cassidy, the gloves are off. In what analysts have called a \"holy grail\" move, Xero’s $2.5 billion acquisition of Melio has fundamentally altered its trajectory in North America."
                }
            ]
        },
        {
            "_type": "block",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "text": "The logic is sound: accounting is historical, but payments are existential. By integrating robust B2B payments directly into the ledger, Xero has solved one of the biggest pain points for US small businesses: cash flow management. It transforms the software from a place where you record history to a place where you transact business."
                }
            ]
        },
        {
            "_type": "block",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "text": "\"In the US, speed of payment is the lifeblood of the SMB economy,\" Cassidy asserts. \"By bringing bill pay and accounts receivable into the same workflow as the general ledger, we aren't just saving time. We are literally improving the liquidity of our customers. That is a value proposition that resonates from Wall Street to Main Street.\""
                }
            ]
        },
        {
            "_type": "block",
            "style": "blockquote",
            "children": [
                {
                    "_type": "span",
                    "text": "\"We aren't just saving time. We are literally improving the liquidity of our customers.\""
                }
            ]
        },
        {
            "_type": "block",
            "style": "h2",
            "children": [{ "_type": "span", "text": "The AI Superagent: JAX" }]
        },
        {
            "_type": "block",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "text": "While payments provide the liquidity, Artificial Intelligence provides the leverage. The crown jewel of Xero’s 2026 vision is JAX—\"Just Ask Xero.\" For decades, small business administration was described as \"death by a thousand clicks\"—endless forms, manual entry, and categorization errors. JAX changes that equation."
                }
            ]
        },
        {
            "_type": "block",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "text": "It is not merely a customer service chatbot; it is a generative AI \"financial superagent\" capable of executing complex workflows. Built on a proprietary Large Language Model fine-tuned on decades of accounting data, JAX understands the nuance of tax codes and cash flow forecasting."
                }
            ]
        },
        {
            "_type": "block",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "text": "\"Imagine telling your software, 'Invoice the client for the Jones project and follow up on the overdue payment from last week,' and it just _happens_,\" says a Xero product lead. \"No menus, no clicks, no searching. That is the promise of JAX. We are moving from a graphical user interface to an intent-based interface.\""
                }
            ]
        },
        {
            "_type": "block",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "text": "This capability was largely accelerated by Xero’s acquisition of Syft Analytics. In less than a year, the company has integrated Syft’s enterprise-grade reporting into the core product, giving a corner bakery the same level of financial insight—and the same predictive power—as a Fortune 500 CFO."
                }
            ]
        },
        {
            "_type": "block",
            "style": "h2",
            "children": [{ "_type": "span", "text": "The Architecture of Trust" }]
        },
        {
            "_type": "block",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "text": "With great power comes great responsibility, particularly when AI is handling bank accounts and tax filings. Cassidy is acutely aware of the 'hallucination' risks associated with GenAI. \"In creative writing, a hallucination is imagination. In accounting, it is fraud,\" she notes dryly. \"We do not have the luxury of being wrong.\""
                }
            ]
        },
        {
            "_type": "block",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "text": "To counter this, Xero has built what they call the \"Architecture of Trust\"—a hybrid system where AI suggests actions, but a deterministic rules engine validates them before execution. This \"human-in-the-loop\" design philosophy ensures that while the AI accelerates the work, the ultimate control remains with the business owner and their accountant. It is a feature that has won over the skeptical accounting community, a critical channel partner for Xero's growth."
                }
            ]
        },
        {
            "_type": "block",
            "style": "blockquote",
            "children": [
                {
                    "_type": "span",
                    "text": "\"In creative writing, a hallucination is imagination. In accounting, it is fraud.\""
                }
            ]
        },
        {
            "_type": "block",
            "style": "h2",
            "children": [{ "_type": "span", "text": "Choosing Possibility: The ROI of Risk" }]
        },
        {
            "_type": "block",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "text": "Cassidy’s leadership style is deeply informed by her eclectic personal journey. Born in Tanzania, raised in Canada with Indian Punjabi Sikh heritage, and forged in the fires of Silicon Valley (StubHub, Google, theBoardlist), she brings a unique outsider-insider perspective to the CEO role."
                }
            ]
        },
        {
            "_type": "block",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "text": "She has navigated the highest levels of tech by adhering to a philosophy she detailed in her bestselling book, _Choose Possibility_. The central thesis is that fear of failure often masquerades as prudence, leading executives to choose the \"safe\" path of stagnation. Cassidy advocates for \"risk agility\"—the ability to take small, calculated risks frequently rather than waiting for one perfect bet."
                }
            ]
        },
        {
            "_type": "block",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "text": "\"Risk-taking isn't about being reckless; it's about being willing to iterate,\" she says. \"You don't need to see the whole staircase to take the first step. You just need to know you can handle stumbling on a stair or two.\""
                }
            ]
        },
        {
            "_type": "block",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "text": "This ethos is visible in Xero’s bold investments in 2025 and 2026. While some shareholders initially balked at the size of the remuneration and investment packages required to attract top talent and acquire Melio, Cassidy held firm. She argued that talent density was the only defense against AI disruption. The results—a \"Rule of 40\" performance combining high growth with profitability—speak for themselves."
                }
            ]
        },
        {
            "_type": "block",
            "style": "h2",
            "children": [{ "_type": "span", "text": "The Future of the Economy" }]
        },
        {
            "_type": "block",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "text": "As 2026 unfolds, Xero’s role is becoming increasingly central. By rewiring how small businesses pay, get paid, and understand their numbers, the company is doing more than selling software; it is strengthening the fabric of the global economy. In a world of uncertainty, Xero offers clarity."
                }
            ]
        },
        {
            "_type": "block",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "text": "\"We are building a legacy that is defined not just by revenue, but by the millions of entrepreneurs who get their nights and weekends back,\" Cassidy concludes, looking out at the horizon. \"That is the ultimate ROI.\""
                }
            ]
        }
    ]

    const query = `*[_type == "csa" && title match "Sukhinder"][0]._id`
    
    try {
        const docId = await client.fetch(query)
        if (!docId) {
            console.log('Document not found.')
            return
        }
        
        console.log(`Patching document ID: ${docId}`)

        await client.patch(docId).set({ body: body }).commit()
        
        console.log('Article content updated successfully.')

    } catch (err) {
        console.error('Error updating document:', err.message)
    }
}

expandArticle()
