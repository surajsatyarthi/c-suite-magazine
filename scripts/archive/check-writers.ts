import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2024-02-05',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
})

async function checkWriters() {
    const writers = await client.fetch(`*[_type == "writer"]{
    _id,
    name,
    writerType
  }`)

    console.log('Existing Writers:')
    writers.forEach((w: any) => {
        console.log(`- ${w.name} (${w.writerType}) [${w._id}]`)
    })
}

checkWriters()
