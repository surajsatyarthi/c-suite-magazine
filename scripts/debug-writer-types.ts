import { createClient } from 'next-sanity'

const client = createClient({
    projectId: '2f93fcy8',
    dataset: 'production',
    apiVersion: '2024-10-01',
    useCdn: false,
})

async function debugWriters() {
    try {
        console.log('Fetching all writers...')
        // Fetch name and writerType for ALL writers
        const writers = await client.fetch(`*[_type == "writer"]{name, writerType, "hasImage": defined(image)}`)

        console.log(`Found ${writers.length} writers.`)

        // Group by writerType
        const byType: Record<string, any[]> = {}
        writers.forEach((w: any) => {
            const type = w.writerType || 'UNDEFINED'
            if (!byType[type]) byType[type] = []
            byType[type].push(w.name)
        })

        console.log('--- Writers by Type ---')
        for (const [type, names] of Object.entries(byType)) {
            console.log(`${type} (${names.length}):`)
            console.log(names.slice(0, 5).join(', ') + (names.length > 5 ? '...' : ''))
        }

        // Specifically check for the authors in the screenshot
        const targetAuthors = [
            "Peter Daisyme", "Eve Gumpel", "Anantha Desikan", "Aytekin Tank",
            "Andres Tovar", "Elisette Carlson", "Adrian Falk", "Jonathan Small"
        ]

        console.log('\n--- Target Authors Check ---')
        targetAuthors.forEach(target => {
            const found = writers.find((w: any) => w.name === target)
            if (found) {
                console.log(`✅ ${target}: writerType="${found.writerType}"`)
            } else {
                console.log(`❌ ${target}: NOT FOUND`)
            }
        })

    } catch (e) {
        console.error('Error:', e)
    }
}

debugWriters()
