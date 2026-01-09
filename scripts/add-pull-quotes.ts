import { client } from '@/lib/sanity'

/**
 * Script to add 4 pull quotes to the Indian Oil CSA article
 * Extracts important statements from the article and inserts them as blockquotes
 */

async function addPullQuotes() {
  const articleSlug = 'shrikant-madhav-vaidya'
  
  // Fetch the current article
  const article = await client.fetch(
    `*[_type == "post" && slug.current == $slug][0] { _id, title, body }`,
    { slug: articleSlug }
  )
  
  if (!article) {
    console.error('❌ Article not found with slug:', articleSlug)
    console.log('Trying to find article...')
    
    // Search for articles with similar titles
    const similarArticles = await client.fetch(
      `*[_type == "post" && title match "*Vaidya*"] { _id, title, slug }`
    )
    console.log('Found articles:', similarArticles)
    return
  }
  
  console.log('✅ Found article:', article.title)
  console.log('Current body blocks:', article.body.length)
  
  // 4 Important pull quotes from the article content
  const pullQuotes = [
    {
      quote: "We are expanding our refineries and putting up more renewable energy projects aimed at extending the refining capacity. IndianOil has invested nearly US$5 billion in its brownfield expansions over the past several years."
    },
    {
      quote: "We didn't allow the pandemic period to derail our capacity expansion plans. Because the country needs it. Now that we have seen pre-pandemic demand levels being substantially surpassed, that decision has proven crucial."
    },
    {
      quote: "What I'm emphasizing is that the narrative about peak oil demand really doesn't hold in a country like India, which is energy-hungry by virtue of its huge population, wherein the capital energy demand is still just one-third of the global average."
    },
    {
      quote: "Energy is naturally the main driver for this growth and fossil fuels will continue to play a significant player for the foreseeable future. It is very clear to everybody that all of these fossil fuels will continue to be in the mix, if not for anything else, at least for the medium term."
    }
  ]
  
  // Create new body array with pull quotes inserted
  const newBody = [...article.body]
  let insertedCount = 0
  
  // Insert quotes at strategic positions (every ~20-25% through)
  const insertPositions = [
    Math.floor(newBody.length * 0.25), // 25% through
    Math.floor(newBody.length * 0.45), // 45% through
    Math.floor(newBody.length * 0.65), // 65% through
    Math.floor(newBody.length * 0.85), // 85% through
  ]
  
  pullQuotes.forEach((quoteData, index) => {
    const blockquote = {
      _type: 'block',
      _key: `quote-${Date.now()}-${index}`,
      style: 'blockquote',
      children: [
        {
          _type: 'span',
          text: quoteData.quote,
          marks: []
        }
      ],
      markDefs: []
    }
    
    // Insert at calculated position (adjust for already inserted quotes)
    const insertAt = insertPositions[index] + insertedCount
    newBody.splice(insertAt, 0, blockquote)
    insertedCount++
    
    console.log(`✅ Inserted quote ${index + 1} at position ${insertAt}:`)
    console.log(`   "${quoteData.quote.substring(0, 60)}..."`)
  })
  
  // Update the article
  try {
    await client
      .patch(article._id)
      .set({ body: newBody })
      .commit()
    
    console.log('\n✅ Successfully added 4 pull quotes to the article!')
    console.log(`Updated body now has ${newBody.length} blocks (was ${article.body.length})`)
  } catch (error) {
    console.error('❌ Error updating article:', error)
  }
}

// Run the function
addPullQuotes().then(() => {
  console.log('\nDone!')
  process.exit(0)
}).catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
