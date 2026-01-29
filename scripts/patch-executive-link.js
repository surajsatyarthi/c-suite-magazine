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

async function patchExecutiveLink() {
    const docId = 'executive-rich-stinson'
    // Correct Link using the REAL slug we found earlier
    // Using the /category/ route as it is standard, but /csa/ would also work now.
    // Let's stick to /category/cxo-interview/rich-stinson-ceo-southwire to be 100% safe.
    const newLink = 'https://csuitemagazine.global/category/cxo-interview/rich-stinson-ceo-southwire'

    try {
        await client
            .patch(docId)
            .set({ link: newLink })
            .commit()
        
        console.log(`Successfully patched ${docId}`)
        console.log(`New Link: ${newLink}`)
    } catch (err) {
        console.error('Error patching document:', err.message)
    }
}

patchExecutiveLink()
