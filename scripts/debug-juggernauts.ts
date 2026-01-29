
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
  token: process.env.SANITY_API_TOKEN, // Use token if available
});

async function run() {
  console.log("Fetching Juggernaut Config...");
  const config = await client.fetch(`*[_type == "industryJuggernautConfig"][0]{
      items[]{
        title,
        link
      }
    }`);

  const rawItems = config?.items || [];
  console.log(`Found ${rawItems.length} items`);
  
  if (rawItems.length === 0) return;

  const slugs = rawItems
    .map((item: any) => {
      if (!item.link) return null;
      const parts = item.link.split('/').filter(Boolean);
      return parts.length > 0 ? parts[parts.length - 1] : null;
    })
    .filter((s: string | null): s is string => Boolean(s));

  console.log("Extracted Slugs:", slugs);

  const docs = await client.fetch(
    `*[_type in ["post", "csa"] && slug.current in $slugs]{ 
          slug, 
          _type,
          "categories": categories[]->{ slug }
        }`,
    { slugs }
  );

  console.log(`Found ${docs.length} matching docs in Sanity`);
  const docMap = new Map(docs.map((d: any) => [d.slug.current, d]));

  rawItems.forEach((item: any) => {
    const slug = (item.link || '').split('/').filter(Boolean).pop();
    const doc = docMap.get(slug);
    console.log(`Item: ${item.title}`);
    console.log(`  Link: ${item.link}`);
    console.log(`  Slug extracted: ${slug}`);
    console.log(`  Doc found: ${!!doc}`);
    if (doc) {
        console.log(`  Doc Type: ${doc._type}`);
    }
  });
}

run().catch(console.error);
