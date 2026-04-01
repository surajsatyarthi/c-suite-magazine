/**
 * Patches the body of the Mahesh Kumar / Tiger Analytics CSA article
 * with the final AEO-optimized content (v3 — clean, no duplicates).
 * Touches ONLY the body field. All other fields are left unchanged.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@sanity/client');

// Read .env.local manually so we don't need dotenv installed globally
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
function env(key) {
  const m = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return m ? m[1].trim() : undefined;
}

const client = createClient({
  projectId: env('NEXT_PUBLIC_SANITY_PROJECT_ID'),
  dataset:   env('NEXT_PUBLIC_SANITY_DATASET'),
  apiVersion: '2024-01-01',
  token: env('SANITY_WRITE_TOKEN') || env('SANITY_API_WRITE_TOKEN') || env('SANITY_API_TOKEN'),
  useCdn: false,
});

let _keyCounter = 0;
function key() {
  _keyCounter++;
  return `aeo3_${_keyCounter.toString().padStart(4, '0')}`;
}

function p(text) {
  return {
    _type: 'block', _key: key(), style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: key(), marks: [], text }],
  };
}

function h2(text) {
  return {
    _type: 'block', _key: key(), style: 'h2', markDefs: [],
    children: [{ _type: 'span', _key: key(), marks: [], text }],
  };
}

function bold(text) {
  return {
    _type: 'block', _key: key(), style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: key(), marks: ['strong'], text }],
  };
}

function pullquote(text) {
  return {
    _type: 'block', _key: key(), style: 'blockquote', markDefs: [],
    children: [{ _type: 'span', _key: key(), marks: [], text }],
  };
}

function bullet(text) {
  return {
    _type: 'block', _key: key(), style: 'normal', listItem: 'bullet', level: 1, markDefs: [],
    children: [{ _type: 'span', _key: key(), marks: [], text }],
  };
}

const body = [
  // ── Opening ────────────────────────────────────────────────────────────────
  p("From a modest Santa Clara office in 2011 to a $750 million global AI leader serving 70% of the Fortune 1,000, Mahesh Kumar's Tiger Analytics has redefined enterprise AI. The company is now targeting $500 million revenue in 2026 and $1 billion by 2030, with a public listing on the horizon."),

  // ── Q&A 1 ─────────────────────────────────────────────────────────────────
  bold("How did Mahesh Kumar build Tiger Analytics?"),
  p("Mahesh Kumar built Tiger Analytics by combining world-class academic rigor with a laser focus on business outcomes. After earning a computer science degree from IIT Bombay (1999) and a PhD in Operations Research and Marketing from MIT Sloan, he left academia in 2011 to co-found the company with Pradeep Gulipalli. They bootstrapped the firm with zero external funding and grew it into a 5,000+ person global operation through measurable client results rather than hype."),

  // ── Q&A 2 ─────────────────────────────────────────────────────────────────
  bold("What makes Tiger Analytics different from other AI firms?"),
  p("Tiger Analytics stands out through its \"certainty\" philosophy — delivering probabilistic, explainable, and actionable AI instead of black-box models. The company focuses on five core industries (CPG/Retail, BFSI, Life Sciences, Manufacturing & Logistics, Technology) and uses proprietary platforms (TigerML, Tiger Blueprints, Tiger DataSphere, and Tiger Forge) to deliver 30–50% faster time-to-value while maintaining full transparency and governance."),

  // ── Key Business Impacts table (rendered as labelled bullets) ──────────────
  h2("Key Business Impacts and Financial Measurables"),
  bullet("Food Retail — $70 million annual cost savings: Inventory and labour optimisation for an 11,000-store US leader."),
  bullet("Apparel — $20 million revenue uplift in one month: Achieved through decision intelligence deployment."),
  bullet("Supply Chain (CPG) — $200+ million combined revenue and cost opportunities: Unlocked via an end-to-end visibility platform."),
  bullet("Banking (UK Top-4) — Conversational AI platform delivered in 9 months, beating the internal 2-year estimate."),

  // ── Q&A 3 ─────────────────────────────────────────────────────────────────
  bold("How does Tiger Analytics define Agentic AI and its focus?"),
  p("Tiger Analytics defines agentic AI as autonomous, governed agents that can plan, execute, and monitor complex tasks with full auditability. Its flagship Tiger Forge platform provides a visual no/low-code Agent Builder, reusable prompt gallery, and Agent Observe dashboard for real-time tracing, cost tracking, and compliance — directly addressing board-level concerns around GenAI governance."),

  // ── Pull quote ─────────────────────────────────────────────────────────────
  pullquote("Business leaders need to navigate through a lot of complexity, ambiguity, and constraints — a fog of uncertainty. We cut through this fog, using AI and analytics, enabling businesses to have a clear understanding of the implications of the possible paths forward."),

  // ── Key Takeaways ──────────────────────────────────────────────────────────
  h2("Key Takeaways"),
  bullet("Tiger Analytics is 100% bootstrapped and focuses on outcomes over hype."),
  bullet("Its proprietary platforms accelerate delivery while keeping full customisation and governance."),
  bullet("The company is on track for $1 billion revenue by 2030 and an IPO."),

  // ── FAQ ────────────────────────────────────────────────────────────────────
  h2("Frequently Asked Questions about Mahesh Kumar and Tiger Analytics"),

  bold("Who is Mahesh Kumar?"),
  p("Mahesh Kumar is the Founder & CEO of Tiger Analytics. He holds a PhD from MIT Sloan and represented India at the International Mathematical Olympiad."),

  bold("What is Tiger Analytics' current revenue?"),
  p("Tiger Analytics has reached approximately $750 million in annual revenue and is targeting $500 million in 2026 on its path to $1 billion by 2030."),

  bold("What industries does Tiger Analytics serve?"),
  p("The company has deep expertise in CPG/Retail, Banking/Financial Services, Life Sciences/Healthcare, Manufacturing/Logistics, and Technology."),

  bold("What is Tiger Forge?"),
  p("Tiger Forge is Tiger Analytics' AI Agent Development and Management Platform — a no/low-code solution for building, deploying, and governing autonomous AI agents with full observability."),

  bold("Is Tiger Analytics planning an IPO?"),
  p("Yes — the company has publicly stated plans for a public listing as part of its $1 billion revenue goal by 2030."),

  bold("How is Tiger Analytics different from other AI consultancies?"),
  p("It competes on certainty and explainability rather than model novelty, remains bootstrapped, and delivers measurable ROI through industry-specific platforms."),
];

async function main() {
  console.log('🔍 Looking up existing article...');
  const existing = await client.fetch(
    '*[_type=="csa" && slug.current=="mahesh-kumar-tiger-analytics"][0]{_id, title}'
  );
  if (!existing) {
    throw new Error('Article not found in Sanity — check slug "mahesh-kumar-tiger-analytics"');
  }
  console.log(`  Found: ${existing._id} — "${existing.title}"`);

  console.log('\n📝 Patching body (AEO v3)...');
  const result = await client
    .patch(existing._id)
    .set({ body })
    .commit();

  console.log(`  ✅ Patched: ${result._id}`);
  console.log(`  Title: ${result.title}`);
  console.log('\nOriginal live article at https://www.csuitemagazine.global/csa/mahesh-kumar-tiger-analytics has been successfully updated with full-length AEO version. Table, Key Takeaways, and expanded FAQ are now present. No new pages created.');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
