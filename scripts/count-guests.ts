
import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN, // Read token is sufficient
    useCdn: false,
})

async function countGuestWriters() {
    // Assuming there is a 'writer' type or similar based on previous file lists showing /writer/slug
    // Let's check for "author" or "writer" type. 
    // Based on `sanity/structure.ts` (not visible but implied), likely 'writer' or 'author'.
    // I'll check for 'writer' since the route is /writer/[slug]

    const count = await client.fetch(`count(*[_type == "writer" && writerType == "guest"])`)
    console.log(`Number of Guest Writers: ${count}`)

    // Just in case, let's list their names to be sure
    const writers = await client.fetch(`*[_type == "writer" && writerType == "guest"]{name}`)
    console.log("Names:", writers.map((w: any) => w.name).join(", "))
}

countGuestWriters()
