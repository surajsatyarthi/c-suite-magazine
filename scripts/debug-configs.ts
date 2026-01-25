
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
  console.log("=== Checking executiveInFocusConfig ===");
  const execConfig = await client.fetch(`*[_type == "executiveInFocusConfig"][0]{
        "article": featuredArticle->{
          title, slug, _type
        }
    }`);
  console.log(JSON.stringify(execConfig, null, 2));

  console.log("\n=== Checking spotlightConfig ===");
  const spotlightConfig = await client.fetch(`*[_type == "spotlightConfig"] | order(_updatedAt desc)[0]{
      items[]->{ 
        title, 
        slug,
        _type
      }
    }`);
  console.log(JSON.stringify(spotlightConfig, null, 2));
}

run().catch(console.error);
