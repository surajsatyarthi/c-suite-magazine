require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@sanity/client')

const token = process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_TOKEN
const dataset = 'production'
const apiVersion = '2024-10-01'

const oldProjectId = 'tgc2j0xx'
const newProjectId = '2f93fcy8'

async function compareProjects() {
    console.log('--- Comparing Sanity Projects ---\n')

    // Client for OLD project
    const oldClient = createClient({
        projectId: oldProjectId,
        dataset,
        apiVersion,
        useCdn: false,
        token
    })

    // Client for NEW project
    const newClient = createClient({
        projectId: newProjectId,
        dataset,
        apiVersion,
        useCdn: false,
        token
    })

    try {
        console.log(`Checking OLD Project (${oldProjectId})...`)
        const oldCount = await oldClient.fetch('count(*)')
        console.log(`✅ OLD Project Document Count: ${oldCount}`)
    } catch (err) {
        console.log(`❌ OLD Project Access Failed: ${err.message}`)
    }

    try {
        console.log(`\nChecking NEW Project (${newProjectId})...`)
        const newCount = await newClient.fetch('count(*)')
        console.log(`✅ NEW Project Document Count: ${newCount}`)
    } catch (err) {
        console.log(`❌ NEW Project Access Failed: ${err.message}`)
    }
}

compareProjects()
