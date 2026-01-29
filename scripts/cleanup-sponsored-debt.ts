import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: '2f93fcy8', // Derived from .env.local in previous step
  dataset: 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const CATEGORY_ID = 'EvGQ6sd56grSJFi2FgvsNS';

async function main() {
  console.log('--- RELAP Protocol: Structural Level Up ---');
  console.log(`Auditing references to Category: ${CATEGORY_ID}...`);

  const references = await client.fetch(`*[references($id)]`, { id: CATEGORY_ID });
  
  if (references.length > 0) {
    console.log(`Found ${references.length} documents referencing this category.`);
    for (const doc of references) {
      console.log(`- ${doc._type}: ${doc.title || doc._id}`);
      
      // If it's a CSA or Post, we should nullify the reference or replace it.
      // Based on user feedback, we want "CXO Interview" (usually 'cxo-interview' slug).
      // Let's find the CXO Interview category ID first.
      const cxoCategory = await client.fetch(`*[_type == "category" && slug.current == "cxo-interview"][0]._id`);
      
      if (cxoCategory) {
        console.log(`  Redirecting reference to CXO Interview (${cxoCategory})...`);
        const patch = client.patch(doc._id);
        
        if (doc.category && doc.category._ref === CATEGORY_ID) {
          patch.set({ category: { _type: 'reference', _ref: cxoCategory } });
        }
        
        if (Array.isArray(doc.categories)) {
          const newCats = doc.categories.map((c: any) => 
            c._ref === CATEGORY_ID ? { ...c, _ref: cxoCategory } : c
          );
          patch.set({ categories: newCats });
        }
        
        await patch.commit();
      }
    }
  } else {
    console.log('No active references found.');
  }

  console.log(`Deleting Category document ${CATEGORY_ID}...`);
  try {
    await client.delete(CATEGORY_ID);
    console.log('SUCCESS: "Company Sponsored" category eliminated.');
  } catch (err: any) {
    console.error('FAILED to delete category:', err.message);
  }
}

main().catch(console.error);
