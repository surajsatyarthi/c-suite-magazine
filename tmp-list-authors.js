const { createClient } = require('@sanity/client');
require('dotenv').config({ path: './.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-28',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

(async () => {
  try {
    const authors = await client.fetch('*[_type=="author"]|order(name asc){_id, name, slug, image{asset->{url}}}');
    for (const a of authors) {
      const slug = a.slug?.current || 'none';
      const img = a.image?.asset?.url ? 'imageUrl' : (a.image ? 'imageObject' : 'none');
      const count = await client.fetch('count(*[_type=="post" && author->slug.current==$slug])', { slug });
      console.log(`- _id: ${a._id} | Name: ${a.name} | slug=${slug} | image=${img} | posts=${count}`);
    }
  } catch (e) {
    console.error('Failed to list authors:', e);
    process.exit(1);
  }
})();