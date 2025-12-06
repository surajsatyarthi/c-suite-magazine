
import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
})

async function listWriterIds() {
    const writers = await client.fetch(`
    *[_type == "writer" && writerType == "guest"] {
      name,
      _id
    }
  `)
    console.log("Guest Writer IDs:")
    writers.forEach((w: any) => console.log(`${w.name}: ${w._id}`))
}

listWriterIds()
