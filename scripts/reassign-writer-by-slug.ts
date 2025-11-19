import dotenv from 'dotenv'
import { createClient } from '@sanity/client'
dotenv.config({ path: './.env.local' })

type Args = {
  slug: string
  newSlug: string
}

function getArgs(): Args {
  const idxSlug = process.argv.indexOf('--slug')
  const idxNew = process.argv.indexOf('--new')
  const slug = idxSlug > -1 ? process.argv[idxSlug + 1] : 'not-every-executive-aims-to-revolutionize-society-but'
  const newSlug = idxNew > -1 ? process.argv[idxNew + 1] : 'raj-patel'
  return { slug, newSlug }
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-28',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function main() {
  const { slug, newSlug } = getArgs()
console.log(`Reassigning posts from writer slug '${slug}' to '${newSlug}'`)

  const badAuthor = await client.fetch(
'*[_type=="writer" && slug.current==$slug][0]{_id, name, slug}',
    { slug }
  )
  if (!badAuthor?._id) {
console.error(`No writer found for slug '${slug}'`)
    process.exit(1)
  }

  const newAuthor = await client.fetch(
'*[_type=="writer" && slug.current==$slug][0]{_id, name, slug}',
    { slug: newSlug }
  )
  if (!newAuthor?._id) {
console.error(`No destination writer found for slug '${newSlug}'`)
    process.exit(1)
  }

  const posts = await client.fetch(
'*[_type=="post" && writer._ref==$aid]{_id, title}',
    { aid: badAuthor._id }
  )

  if (!posts?.length) {
console.log('No posts reference the bad writer. Nothing to change.')
    return
  }

  for (const p of posts) {
    await client
      .patch(p._id)
.set({ writer: { _type: 'reference', _ref: newAuthor._id } })
      .commit()
    console.log(`Reassigned post ${p._id} | ${p.title} -> ${newAuthor.slug.current}`)
  }

  console.log(`Done. Updated ${posts.length} post(s).`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
