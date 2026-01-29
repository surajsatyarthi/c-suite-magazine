
import { createClient } from "next-sanity";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-02-05",
  useCdn: false, // Force fresh data
  token: process.env.SANITY_API_TOKEN, 
});

async function run() {
  console.log("Fetching SpotlightWidget candidates...");
  const query = `*[_type == "post" 
    && "cxo-interview" in categories[]->slug.current
    && defined(mainImage)
  ] | order(publishedAt desc)[0...10] {
    title,
    slug,
    _type,
    "categories": categories[]->{slug}
  }`;

  const articles = await client.fetch(query);
  console.log(`Found ${articles.length} articles`);
  
  articles.forEach((a: any) => {
      console.log(`- ${a.title} (${a._type}) [${a.slug.current}]`);
      console.log(`  Cats: ${JSON.stringify(a.categories)}`);
  });

  const brokenSlugs = [
      'stella-ambrose-deputy-ceo-sawit-kinabalu',
      'rich-stinson-ceo-southwire',
      'sukhinder-singh-cassidy-rewiring-global-economy'
  ];

  console.log("\nChecking for specific broken slugs as POSTs:");
  const duplicates = await client.fetch(`*[_type == "post" && slug.current in $slugs]{ title, slug, _type }`, { slugs: brokenSlugs });
  console.log(JSON.stringify(duplicates, null, 2));
}

run().catch(console.error);
