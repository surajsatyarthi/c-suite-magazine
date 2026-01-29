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

async function swapItems() {
    const spotlightId = 'spotlightConfig'
    
    try {
        const doc = await client.getDocument(spotlightId)
        if (!doc || !doc.items) throw new Error('No spotlight items found')

        const items = [...doc.items]
        
        // Ensure we have enough items
        if (items.length < 3) {
            console.log('Not enough items to swap.')
            return
        }

        // Current: [0:Rich, 1:Sukhinder, 2:Stella]
        // Target:  [0:Rich, 1:Stella, 2:Sukhinder]
        // We swap index 1 and 2
        
        const temp = items[1]
        items[1] = items[2]
        items[2] = temp

        await client
            .patch(spotlightId)
            .set({ items: items })
            .commit()

        console.log('Swapped Index 1 (Sukhinder) with Index 2 (Stella).')
        console.log('Sukhinder is now at Index 2 (3rd Position Overall).')

    } catch (err) {
        console.error('Error:', err.message)
    }
}

swapItems()
