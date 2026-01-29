import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { createClient } from '@sanity/client';
import { config } from '../sanity/config';

const client = createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion,
    useCdn: false,
    token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
});

async function addPullQuotesCSA() {
  const articleSlug = 'shrikant-vaidya-chairman-indianoil'
  
  // Fetch the CSA article
  const article = await client.fetch(
    `*[_type == "csa" && slug.current == $slug][0] { _id, title, body }`,
    { slug: articleSlug }
  )
  
  if (!article) {
    console.error('❌ CSA article not found')
    return
  }
  
  console.log('✅ Found CSA article:', article.title)
  console.log('Current body blocks:', article.body.length)
  
  // 4 Important pull quotes from the Indian Oil article
  const pullQuotes = [
    "We are expanding our refineries and putting up more renewable energy projects aimed at extending the refining capacity. IndianOil has invested nearly US$5 billion in its brownfield expansions over the past several years.",
    
    "We didn't allow the pandemic period to derail our capacity expansion plans. Because the country needs it. Now that we have seen pre-pandemic demand levels being substantially surpassed, that decision has proven crucial.",
    
    "What I'm emphasizing is that the narrative about peak oil demand really doesn't hold in a country like India, which is energy-hungry by virtue of its huge population, wherein the capital energy demand is still just one-third of the global average.",
    
    "Energy is naturally the main driver for this growth and fossil fuels will continue to play a significant player for the foreseeable future. It is very clear to everybody that all of these fossil fuels will continue to be in the mix, if not for anything else, at least for the medium term."
  ]
  
  // Create new body array with pull quotes inserted
  const newBody = [...article.body]
  let insertedCount = 0
  
  // Insert quotes at strategic positions (25%, 45%, 65%, 85% through article)
  const insertPositions = [
    Math.floor(newBody.length * 0.25),
    Math.floor(newBody.length * 0.45),
    Math.floor(newBody.length * 0.65),
    Math.floor(newBody.length * 0.85),
  ]
  
  pullQuotes.forEach((quote, index) => {
    const blockquote = {
      _type: 'block',
      _key: `pullquote-${Date.now()}-${index}`,
      style: 'blockquote',
      children: [
        {
          _type: 'span',
          text: quote,
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
    console.log(`   "${quote.substring(0, 70)}..."`)
  })
  
  // Update the article
  try {
    await client
      .patch(article._id)
      .set({ body: newBody })
      .commit()
    
    console.log('\n🎉 Successfully added 4 pull quotes to the article!')
    console.log(`✅ Updated body: ${newBody.length} blocks (was ${article.body.length})`)
    console.log('\nPull quotes will appear:')
    console.log('  - Centered on the page')
    console.log('  - Navy blue color (#082945)')
    console.log('  - Italic font style')
    console.log('  - Larger font size (24px)')
    console.log('\nRefresh https://csuitemagazine.global/csa/shrikant-vaidya-chairman-indianoil to see the quotes!')
  } catch (error) {
    console.error('❌ Error updating article:', error)
  }
}

addPullQuotesCSA().then(() => {
  console.log('\n✅ Done!')
  process.exit(0)
}).catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
