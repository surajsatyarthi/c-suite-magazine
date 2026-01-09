import { client } from '@/lib/sanity'

async function searchByUrl() {
  // The URL is /csa/shrikant-vaidya-chairman-indianoil
  // So slug should be "shrikant-vaidya-chairman-indianoil"
  
  const article = await client.fetch(`
    *[_type == "post" && slug.current == "shrikant-vaidya-chairman-indianoil"][0] {
      _id,
      title,
      "slug": slug.current,
      "hasBody": defined(body),
      "bodyLength": length(body)
    }
  `)
  
  if (article) {
    console.log('✅ FOUND IT!')
    console.log(JSON.stringify(article, null, 2))
  } else {
    console.log('❌ Not found with that exact slug')
    console.log('\nSearching all posts with "vaidya" in slug...')
    
    const similar = await client.fetch(`
      *[_type == "post" && slug.current match "*vaidya*"] {
        title,
        "slug": slug.current
      }
    `)
    
    console.log('Similar slugs:', similar)
    
    if (similar.length === 0) {
      console.log('\nSearching all posts (first 50)...')
      const all = await client.fetch(`
        *[_type == "post"] | order(publishedAt desc)[0...50] {
          title,
          "slug": slug.current,
          publishedAt
        }
      `)
      console.log('\nRecent articles:')
      all.forEach((a: any) => console.log(`- ${a.slug}: ${a.title.substring(0, 60)}`))
    }
  }
}

searchByUrl().then(() => process.exit(0))
