const { createClient } = require('@sanity/client')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function textBlock(text) {
  return {
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', text }],
  }
}

function parseMarkdownToBlocks(content) {
  // Split content into paragraphs and convert to Sanity blocks
  const paragraphs = content
    .split('\n\n')
    .filter(p => p.trim())
    .map(p => p.replace(/\n/g, ' ').trim())
  
  return paragraphs.map(paragraph => {
    // Handle headers
    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
      return {
        _type: 'block',
        style: 'h3',
        markDefs: [],
        children: [{ _type: 'span', text: paragraph.replace(/\*\*/g, '') }],
      }
    }
    
    // Handle regular paragraphs with bold text
    if (paragraph.includes('**')) {
      const parts = paragraph.split('**')
      const children = []
      
      for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
          // Regular text
          if (parts[i]) {
            children.push({ _type: 'span', text: parts[i] })
          }
        } else {
          // Bold text
          children.push({
            _type: 'span',
            text: parts[i],
            marks: ['strong']
          })
        }
      }
      
      return {
        _type: 'block',
        style: 'normal',
        markDefs: [],
        children: children.filter(child => child.text),
      }
    }
    
    // Regular paragraph
    return textBlock(paragraph)
  })
}

async function getWriters() {
  const writers = await client.fetch('*[_type == "writer"] | order(slug.current asc){ _id, name, slug }')
  if (!writers?.length) throw new Error('No writers found in Sanity')
  return writers
}

async function getCategoryRefBySlug(categorySlug) {
  const category = await client.fetch('*[_type == "category" && slug.current == $slug][0]{ _id }', { slug: categorySlug })
  if (!category?._id) {
    console.warn(`Category not found for slug: ${categorySlug}, using default`)
    // Get a default category or create one
    const defaultCategory = await client.fetch('*[_type == "category"][0]{ _id }')
    return defaultCategory ? { _type: 'reference', _ref: defaultCategory._id } : null
  }
  return { _type: 'reference', _ref: category._id }
}

async function uploadImageFromUrl(url, filenameHint = 'image.jpg') {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`)
    const buffer = Buffer.from(await res.arrayBuffer())
    const asset = await client.assets.upload('image', buffer, { filename: filenameHint })
    return asset
  } catch (error) {
    console.warn(`Failed to upload image from ${url}:`, error.message)
    return null
  }
}

async function importCXOInterviews() {
  try {
    // Read the JSON file
    const jsonPath = path.join(__dirname, '../../cxo interviews spun/cxo_interviews_spun.json')
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    
    console.log(`Found ${jsonData.length} CXO interviews to import`)
    
    let successCount = 0
    let errorCount = 0

    // Load writers and assign round-robin for equal distribution
    const writers = await getWriters()
    let writerIndex = 0
    
    for (const [index, interview] of jsonData.entries()) {
      try {
        console.log(`Processing ${index + 1}/${jsonData.length}: ${interview.title}`)
        
        const slug = generateSlug(interview.title)
        
        // Check if post already exists
        const existingPost = await client.fetch('*[_type == "post" && slug.current == $slug][0]', { slug })
        if (existingPost) {
          console.log(`Post already exists: ${interview.title}`)
          continue
        }
        
        // Assign writer equally (round-robin)
        const writerRef = { _type: 'reference', _ref: writers[writerIndex % writers.length]._id }
        writerIndex++
        
        // Parse category from the category field
        let categoryRefs = []
        if (interview.category) {
          // Extract the last part of the category path as the slug
          const categorySlug = interview.category.split('/').pop()
          const categoryRef = await getCategoryRefBySlug(categorySlug)
          if (categoryRef) {
            categoryRefs = [categoryRef]
          }
        }
        
        // Parse content to blocks
        const bodyBlocks = parseMarkdownToBlocks(interview.content)
        
        // Create excerpt from first paragraph
        const excerpt = interview.content
          .split('\n\n')[0]
          .replace(/\*\*/g, '')
          .substring(0, 200) + '...'
        
        // Calculate read time (assuming 200 words per minute)
        const readTime = Math.max(1, Math.ceil(interview.word_count / 200))
        
        // Try to get a stock image for the article
        const stockImages = [
          'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=800&fit=crop',
          'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop',
          'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=800&fit=crop',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop',
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=800&fit=crop'
        ]
        const randomImageUrl = stockImages[index % stockImages.length]
        
        let imageAsset = null
        try {
          imageAsset = await uploadImageFromUrl(randomImageUrl, `${slug}-hero.jpg`)
        } catch (error) {
          console.warn(`Failed to upload image for ${interview.title}:`, error.message)
        }
        
        // Create the post document
        const postDoc = {
          _type: 'post',
          title: interview.title,
          slug: { _type: 'slug', current: slug },
          excerpt,
          writer: writerRef,
          categories: categoryRefs,
          readTime,
          body: bodyBlocks,
          publishedAt: new Date().toISOString(),
          ...(imageAsset && {
            mainImage: {
              _type: 'image',
              asset: { _type: 'reference', _ref: imageAsset._id },
              alt: `${interview.title} - Executive Interview`
            }
          })
        }
        
        // Create the document in Sanity
        const result = await client.create(postDoc)
        console.log(`✅ Created: ${interview.title} (ID: ${result._id})`)
        successCount++
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error(`❌ Failed to import ${interview.title}:`, error.message)
        errorCount++
      }
    }
    
    console.log(`\n🎉 Import completed!`)
    console.log(`✅ Successfully imported: ${successCount} articles`)
    console.log(`❌ Failed to import: ${errorCount} articles`)
    
  } catch (error) {
    console.error('Failed to import CXO interviews:', error)
    process.exit(1)
  }
}

importCXOInterviews()
