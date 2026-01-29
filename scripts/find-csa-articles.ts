import { client } from '@/lib/sanity'

async function findCSA() {
  // Search for CSA articles
  const results = await client.fetch(`
    *[_type == "post" && "company-sponsored" in categories[]->slug.current] {
      _id,
      title,
      "slug": slug.current,
      publishedAt
    } | order(publishedAt desc)[0...20]
  `)
  
  console.log('Found CSA articles:')
  results.forEach((article: any, index: number) => {
    console.log(`${index + 1}. ${article.title}`)
    console.log(`   Slug: ${article.slug}`)
    console.log(`   URL: /csa/${article.slug}`)
    console.log('')
  })
}

findCSA().then(() => process.exit(0))
