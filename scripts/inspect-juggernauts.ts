
import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'

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

async function inspect() {
    const config = await client.fetch(`*[_type == "industryJuggernautConfig"][0]`)
    if (!config) {
        console.log("No config found.")
        return
    }

    console.log(`Found ${config.items?.length} items.`)
    if (config.items) {
        config.items.forEach((item: any, i: number) => {
            console.log(`[${i}] Title: ${item.title}, Link: ${item.link}`)
        })
    }
}

inspect()
