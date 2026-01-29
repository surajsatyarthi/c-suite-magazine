import { client } from '@/lib/sanity'

async function checkWriters() {
  // Check what writers exist and have images
  const writers = await client.fetch(`
    *[_type == "post" 
      && "cxo-interview" in categories[]->slug.current
      && defined(writer)
    ] | order(publishedAt desc)[0...10] {
      title,
      publishedAt,
      "writerName": writer->name,
      "writerSlug": writer->slug.current,
      "writerPosition": writer->position,
      "writerCompany": writer->company,
      "hasImage": defined(writer->image),
      "imageUrl": writer->image.asset->url
    }
  `)
  
  console.log('Recent CXO Interview articles and their writers:')
  console.log(JSON.stringify(writers, null, 2))
}

checkWriters().then(() => process.exit(0))
