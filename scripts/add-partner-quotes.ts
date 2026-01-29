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

// Partner quotes data
const partnerQuotes = [
  {
    company: "AVEVA",
    name: "Emon Zaman",
    title: "Senior Vice President, Asia Pacific",
    quote: "Powering economies with clean and renewable energy sources is AVEVA's vision. We aim to help customers save up on energy costs and lower their emissions with our software, aligning with India's sustainability goals across the United Nations SDGs."
  },
  {
    company: "W R Grace and ART",
    name: "Vipan Goel",
    title: "Business Director, FCC and Hydroprocessing",
    quote: "Grace is at the forefront of the India refining industry, delivering value for customers like IOCL. Grace continues to improve refiner profitability by driving conventional yield improvements, meeting emission targets and shaping sustainability goals. We are proud of our relationship with IOCL."
  },
  {
    company: "L&T",
    name: "Subramanian Sarma",
    title: "Whole-time Director & Senior Executive Vice President (Energy)",
    quote: "L&T is privileged to associate with IndianOil and remains committed to supporting its future growth and green energy ambitions. We will continue to be IndianOil's trusted partner as it realises its dream of being a global integrated energy major."
  },
  {
    company: "Isgec Hitachi Zosen",
    name: "Sanjay Gulati",
    title: "Managing Director",
    quote: "We are honoured and proud to be the provider of critical solutions to Indian Oil Corporation Limited, India's largest oil refinery. We wish Shrikant Madhav Vaidya and IndianOil a roaring success for the future."
  },
  {
    company: "Hewlett Packard Enterprise, India",
    name: "Som Satsangi",
    title: "Senior Vice President & Managing Director",
    quote: "HPE is helping oil and gas organizations build robust roadmaps to transition to the new normal. The HPE team worked closely with one of the largest commercial oil companies in India, IndianOil Corporation, to seamlessly complete a massive migration to SAP HANA that accelerated business performance and prepared the company for future growth."
  },
  {
    company: "Technip Energies India",
    name: "Davendra Kumar",
    title: "Managing Director",
    quote: "Leveraging our decades-long expertise in technology, engineering, project management, products and services from concept to delivery of energy infrastructures in adherence to quality and safety, we are proud to have built an energy independent India together with IndianOil."
  },
  {
    company: "Süd-Chemie India",
    name: "S Prakash Babu",
    title: "CEO",
    quote: "Over the past decade, Süd-Chemie India has scaled up and commercialised several catalysts indigenously developed by IndianOil research and development. Süd-Chemie takes immense pride in our partnership with IndianOil, which has led to commercial deployment of indigenous refining catalysts in several refineries."
  }
];

async function addPartnerQuotes() {
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
  
  // Create a custom block type for partner quotes section
  const partnerQuotesBlock = {
    _type: 'partnerQuotes',
    _key: `partner-quotes-${Date.now()}`,
    quotes: partnerQuotes.map((q, i) => ({
      _key: `quote-${i}`,
      _type: 'partnerQuote',
      ...q
    }))
  }
  
  // Add to end of body
  const newBody = [...article.body, partnerQuotesBlock]
  
  console.log('\n✅ Adding partner quotes section with', partnerQuotes.length, 'quotes')
  
  // Update the article
  try {
    await client
      .patch(article._id)
      .set({ body: newBody })
      .commit()
    
    console.log('\n🎉 Successfully added partner quotes to the article!')
    console.log(`✅ Updated body: ${newBody.length} blocks (was ${article.body.length})`)
    console.log('\nPartner quotes will appear at the end of the article.')
  } catch (error) {
    console.error('❌ Error updating article:', error)
  }
}

addPartnerQuotes().then(() => {
  console.log('\n✅ Done!')
  process.exit(0)
}).catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
