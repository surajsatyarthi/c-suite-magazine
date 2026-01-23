import { GET } from '../app/sitemap.xml/route';

async function auditSitemap() {
  console.log("--- Sitemap Audit (Proof Law) ---");
  
  // Convert Response to Text
  const response = await GET();
  const xml = await response.text();
  
  // 1. Check for CSA (Company Sponsored Article)
  const hasCSA = xml.includes('/csa/');
  console.log(`Contains '/csa/' URLS: ${hasCSA ? '✅ YES' : '❌ NO'}`);
  
  // 2. Check for Tags
  const hasTags = xml.includes('/tag/');
  console.log(`Contains '/tag/' URLS: ${hasTags ? '✅ YES' : '❌ NO'}`);
  
  // 3. Count Entities
  const count = (xml.match(/<loc>/g) || []).length;
  console.log(`Total URLs: ${count}`);
}

auditSitemap();
