import { createClient } from 'next-sanity'

const client = createClient({
    projectId: '2f93fcy8',
    dataset: 'production',
    apiVersion: '2024-10-01',
    useCdn: false,
})

async function findAuthor() {
    // Try to find one of the authors from the screenshot
    const name = "Peter Daisyme"
    const query = `*[_type == "writer" && name match "${name}"] {
    _id,
    name,
    writerType,
    position,
    slug
  }`

    try {
        console.log(`Searching for author: ${name}`)
        const authors = await client.fetch(query)
        console.log('Authors found:', authors.length)
        console.log(JSON.stringify(authors, null, 2))

        if (authors.length > 0) {
            console.log("Writer Type is:", authors[0].writerType)
        } else {
            console.log("Author not found. Listing first 10 writers to check data structure:")
            const allWriters = await client.fetch(`*[_type == "writer"][0...10]{name, writerType}`)
            console.log(JSON.stringify(allWriters, null, 2))
        }

    } catch (e) {
        console.error('Error:', e)
    }
}

findAuthor()
