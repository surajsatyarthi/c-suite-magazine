const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2025-10-28',
  token: process.env.SANITY_API_TOKEN, // You'll need to add this
  useCdn: false,
});

const categories = [
  { title: 'Leadership', color: '#082945' },
  { title: 'Business', color: '#c8ab3d' },
  { title: 'Manufacturing', color: '#475569' },
  { title: 'Public Sector', color: '#0f172a' },
  { title: 'Events', color: '#b39935' },
  { title: 'Innovation', color: '#2563eb' },
  { title: 'Not-For-Profit', color: '#10b981' },
  { title: 'Philanthropy', color: '#8b5cf6' },
  { title: 'IT & Telco', color: '#3b82f6' },
  { title: 'Money & Finance', color: '#c8ab3d' },
  { title: 'Engineering', color: '#64748b' },
  { title: 'Science & Technology', color: '#0ea5e9' },
  { title: 'Sustainability', color: '#22c55e' },
  { title: 'Professional Services', color: '#082945' },
  { title: 'Startups', color: '#f59e0b' },
  { title: 'Retail', color: '#ef4444' },
  { title: 'Energy', color: '#eab308' },
  { title: 'Changemakers', color: '#14b8a6' },
  { title: 'CEO Woman', color: '#db2777' },
  { title: 'Education', color: '#6366f1' },
  { title: 'Automotive & Logistics', color: '#475569' },
  { title: 'Healthcare', color: '#dc2626' },
  { title: 'Entrepreneurs', color: '#c8ab3d' },
  { title: 'Property & Real Estate', color: '#0891b2' },
  { title: 'BFSI', color: '#082945' },
  { title: 'Construction & Mining', color: '#78716c' },
];

async function populateCategories() {
  console.log('Starting to populate categories...');
  
  for (const category of categories) {
    try {
      const slug = category.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      const doc = {
        _type: 'category',
        title: category.title,
        slug: {
          _type: 'slug',
          current: slug,
        },
        description: `Explore ${category.title} articles and insights`,
        color: category.color,
      };

      const result = await client.create(doc);
      console.log(`✓ Created: ${category.title}`);
    } catch (error) {
      console.error(`✗ Failed to create ${category.title}:`, error.message);
    }
  }
  
  console.log('\nDone! Categories have been populated.');
}

populateCategories();
