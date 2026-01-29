require('dotenv').config({path: '.env.local'});
import { getClient } from '../lib/sanity';

// Use read-only client for monitoring
const client = getClient();

/**
 * Week 4: Monthly Tag Monitoring
 * Generates a quality report and flags issues for manual review.
 */

async function runMonthlyMonitoring() {
  console.log('📊 Starting Monthly Tag Monitoring Audit...\n');

  const query = `*[_type in ["post", "csa"] && defined(tags)] {
    _id,
    title,
    tags,
    _updatedAt
  }`;

  const docs = await client.fetch(query);
  
  const tagStats = new Map<string, { count: number; articles: string[] }>();
  const totalArticles = docs.length;

  docs.forEach((doc: any) => {
    doc.tags.forEach((tag: string) => {
      const normalized = tag.trim();
      if (!tagStats.has(normalized)) {
        tagStats.set(normalized, { count: 0, articles: [] });
      }
      const stat = tagStats.get(normalized)!;
      stat.count++;
      if (stat.articles.length < 3) {
        stat.articles.push(doc.title);
      }
    });
  });

  const sortedTags = Array.from(tagStats.entries()).sort((a, b) => b[1].count - a[1].count);
  
  // 1. Identify New Single-Use Tags
  const singleUse = sortedTags.filter(([, stat]) => stat.count === 1);
  
  // 2. Identify Potential Case Inconsistencies
  const casePotential = new Map<string, string[]>();
  tagStats.forEach((_, tag) => {
    const lower = tag.toLowerCase();
    if (!casePotential.has(lower)) casePotential.set(lower, []);
    casePotential.get(lower)!.push(tag);
  });
  const caseIssues = Array.from(casePotential.entries()).filter(([, variants]) => variants.length > 1);

  // 3. Identify Stopwords (Should be 0 due to validation, but good to check)
  const STOPWORDS = ['the', 'and', 'with', 'for', 'from', 'this', 'that'];
  const foundStopwords = sortedTags.filter(([tag]) => STOPWORDS.includes(tag.toLowerCase()));

  // Output Report
  console.log('=== MONTHLY TAG AUDIT REPORT ===');
  console.log(`Date: ${new Date().toISOString().split('T')[0]}`);
  console.log(`Total Articles: ${totalArticles}`);
  console.log(`Total Unique Tags: ${tagStats.size}\n`);

  console.log('❌ CRITICAL ISSUES');
  console.log(`- Stopwords Found: ${foundStopwords.length}`);
  foundStopwords.forEach(([tag, stat]) => console.log(`  > "${tag}" used in ${stat.count} articles`));
  
  console.log(`- Case Inconsistencies: ${caseIssues.length}`);
  caseIssues.forEach(([lower, variants]) => console.log(`  > "${lower}" has variants: ${variants.join(', ')}`));

  console.log('\n⚠️ OPPORTUNITIES FOR CONSOLIDATION');
  console.log(`- Single-use Tags: ${singleUse.length}`);
  singleUse.slice(0, 10).forEach(([tag, stat]) => {
    console.log(`  > "${tag}" (Article: "${stat.articles[0]}")`);
  });
  if (singleUse.length > 10) console.log(`    ... and ${singleUse.length - 10} more.`);

  console.log('\n✅ HEALTH CHECK');
  const healthScore = Math.max(0, 100 - (foundStopwords.length * 10) - (caseIssues.length * 5) - (Math.floor(singleUse.length / 5)));
  console.log(`Taxonomy Health Score: ${healthScore}/100`);

  if (healthScore < 80) {
    console.log('\n🚨 ACTION GUIDANCE: Health score is below 80. Recommended to run consolidation or cleanup scripts.');
  } else {
    console.log('\n✨ Taxonomy is in great shape!');
  }
}

runMonthlyMonitoring().catch(console.error);
