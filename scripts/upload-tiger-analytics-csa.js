const fs = require('fs');
const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const WRITER_ID = 'R4nh1tgtHdOlPpvIZ0G1SE'; // CSuite Editorial Team

function key() {
  return Math.random().toString(36).slice(2, 10);
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

function pullquote(text) {
  return {
    _type: 'block', _key: key(), style: 'blockquote', markDefs: [],
    children: [{ _type: 'span', _key: key(), marks: [], text }],
  };
}

async function main() {
  // ── Step 1: Upload images from Desktop ─────────────────────────────────────
  console.log('📸 Uploading images from Desktop...');

  
  // Bypassed image upload for AEO patch
  const heroAsset = { _id: "image-dummy" };
  const portraitAsset = { _id: "image-dummy" };


  // ── Step 2: Build article body

  const body = [
    // ── Intro ─────────────────────────────────────────────────────────────────
    p("In 2011, when Mahesh Kumar co-founded Tiger Analytics from a modest office in Santa Clara, the concept of artificial intelligence transforming enterprise decision-making was still largely theoretical. Large corporations relied on spreadsheets, dashboards, and intuition. Data science teams were small, siloed, and rarely connected to the boardroom. Kumar, fresh from a distinguished academic career spanning MIT and the University of Maryland, saw a different future — one where rigorous, mathematically grounded AI could cut through the noise of business complexity and give leaders the clarity they needed to act with confidence."),
    p("Fourteen years later, that vision has become a $750 million reality. Tiger Analytics now employs more than 5,000 professionals across four continents, serves over 130 companies — 70 percent of them Fortune 1,000 — and has completed more than 50 generative AI implementations for some of the world's most demanding enterprises. The company has won the Databricks Enterprise AI Partner of the Year award, been named a Leader in ISG's Generative AI Services rankings, earned a place on the Inc. 5000 list multiple times, and is openly targeting a billion-dollar revenue milestone by 2030, with a public listing firmly on the horizon."),
    p("Yet speak to Kumar and what strikes you immediately is not the scale of what he has built, but the clarity with which he articulates why he built it."),
    pullquote('"Business leaders need to navigate through a lot of complexity, ambiguity, and constraints — a fog of uncertainty. We cut through this fog, using AI and analytics, enabling businesses to have a clear understanding of the implications of the possible paths forward."'),
    p("That is not a tagline. It is the operating philosophy of a company that has spent over a decade building not just technology, but trust — trust earned through measurable outcomes, co-created solutions, and an unwavering commitment to never being a black box."),

    // ── Section 1 ─────────────────────────────────────────────────────────────
    h2("How did Mahesh Kumar build Tiger Analytics?"),
    p("Mahesh Kumar's journey to building one of the world's most respected AI companies began in the classrooms of IIT Bombay, where he earned his degree in computer science in 1999. A remarkable student from Bihar — a state he credits with instilling in him a deep sense of resilience and intellectual curiosity — his abilities were evident from an early age. In 1994, while still a schoolboy, he represented India at the International Mathematical Olympiad in Hong Kong, returning home with a bronze medal and a lifelong belief in the power of rigorous thinking."),
    p("That combination of computational rigour and analytical instinct earned him a place at MIT's Sloan School of Management, where he pursued his PhD in Operations Research and Marketing. His doctoral thesis — on error-based clustering for sales forecasts in fashion retail — was not merely academic. It produced a US patent (#6,834,266), a tangible marker of practical value derived from theoretical inquiry. The experience of translating a complex mathematical problem into a real-world business solution would prove formative."),
    p("After a stint as a Faculty Research Associate at MIT Sloan, Kumar moved into academia, holding assistant professorships at both the R.H. Smith School of Business at the University of Maryland and Rutgers Business School, where he conducted research in data mining and statistical modelling. He could have followed a comfortable and distinguished academic career. Instead, in 2011, he and IIT Madras alumnus Pradeep Gulipalli chose a different path."),
    pullquote('"There was no shortage of providers who could produce reports and dashboards — but when it came to more advanced applications of data science and machine learning to drive business decisions, there was a real gap."'),
    p("Together, the two co-founders bootstrapped Tiger Analytics — a decision they have never reversed. In a landscape crowded with venture-backed analytics firms, Tiger Analytics remains entirely self-funded. Without the pressure of investor returns driving growth for its own sake, the company has been free to prioritise quality over quantity, depth over breadth, and long-term client relationships over short-term revenue. The result is an organisation whose reputation within the Fortune 1,000 has been built not on marketing spend, but on outcomes."),

    // ── Section 2 ─────────────────────────────────────────────────────────────
    h2("What makes Tiger Analytics different from other AI firms?"),
    p("What separates Tiger Analytics from the dozens of AI consultancies that have proliferated over the past decade? The answer lies in a philosophy Kumar describes as 'certainty' — the art and science of making AI outcomes more trustworthy, more explainable, and more actionable."),
    p("In a market where many AI vendors compete on the novelty of their models, Tiger Analytics competes on the reliability of its results. The company's approach to probabilistic AI — incorporating Bayesian modelling, ensemble techniques, and uncertainty quantification — is designed to ensure that business leaders receive not just a prediction, but a calibrated measure of confidence in that prediction. In industries like financial services, healthcare, and supply chain management, the difference between a deterministic output and a probabilistic one can be the difference between a well-informed decision and a costly mistake."),
    pullquote('"It\'s not about building the most sophisticated model or applying the latest technique. It\'s about really understanding the business problem and designing a solution that delivers value in the client\'s specific context."'),
    p("The company's industry focus has also been deliberate. Rather than spreading itself thin across every vertical, Tiger Analytics has built deep domain expertise in five core sectors: Consumer Packaged Goods and Retail; Banking, Financial Services and Insurance; Life Sciences and Healthcare; Manufacturing and Logistics; and Technology. Within each, it has accumulated the kind of institutional knowledge — of regulatory environments, data architectures, seasonal dynamics, and organisational structures — that no generalist consultancy can replicate."),
    
    // DATA HIGHLIGHT BLOCK: Cost Savings and Impact
    {
      _type: 'block',
      style: 'normal',
      children: [{ _type: 'span', text: 'Key Business Impacts and Financial measurables:' }],
    },
    {
      _type: 'block',
      listItem: 'bullet',
      children: [{ _type: 'span', text: 'Food Retail: $70 Million in annual cost savings achieved through inventory and labour optimisation for a 11,000-store US leader.' }],
    },
    {
      _type: 'block',
      listItem: 'bullet',
      children: [{ _type: 'span', text: 'Apparel Sector: $20 Million in revenue uplift within a single month of deploying decision intelligence.' }],
    },
    {
      _type: 'block',
      listItem: 'bullet',
      children: [{ _type: 'span', text: 'Supply Chain: Over $200 Million in combined revenue and cost opportunities unlocked for a CPG major via end-to-end visibility.' }],
    },
    {
      _type: 'block',
      listItem: 'bullet',
      children: [{ _type: 'span', text: 'Banking: Conversational AI delivered in 9 months for a UK Top-4 bank, beating the internal 2-year estimate.' }],
    },
    p("These are not exceptional anecdotes. They are representative of a systematic approach to extracting measurable, auditable value from data — and they explain why 70 percent of Tiger Analytics' clients are Fortune 1,000 companies who have chosen to expand, not merely renew, their relationships with the firm."),

    // ── Section 3 ─────────────────────────────────────────────────────────────
    h2("How does Tiger Analytics define Agentic AI and its focus?"),
    p("Over the past several years, Tiger Analytics has made significant investments in building a proprietary IP layer that underpins its client work — a suite of platforms and frameworks that accelerate delivery while maintaining the customisation that enterprises demand."),
    p("At the centre of this is TigerML, a modular machine learning toolkit that spans the full AI lifecycle from data preparation through to model deployment and monitoring. By standardising the scaffolding of AI projects, TigerML delivers 30 to 50 percent faster time-to-value compared with building from scratch — while leaving client-specific customisation fully intact. Alongside it, Tiger Blueprints provides a library of more than 40 industry-specific AI solution frameworks covering CPG, insurance, pharmaceuticals, banking, financial services, and manufacturing, each fusing TigerML modules with deep domain knowledge."),
    p("For data infrastructure, Tiger DataSphere provides accelerators and frameworks for building and managing data ecosystems across AWS, Microsoft Azure, Google Cloud Platform, Databricks, and Snowflake. Its GenAI-powered modules include self-service chatbots, code generation tools, and synthetic data generation — capabilities that have moved rapidly from innovation to enterprise standard."),
    p("Perhaps the most significant recent addition to Tiger Analytics' platform portfolio is Tiger Forge — an AI Agent Development and Management Platform purpose-built for the era of agentic AI. Tiger Forge provides enterprises with a visual, no/low-code Agent Builder, an Agent and Prompt Gallery for reusable components, and Agent Observe: a unified dashboard offering real-time tracing, logging, monitoring, cost tracking, and role-based access control. In a market where generative AI governance is fast becoming a board-level concern, Tiger Forge addresses the questions that matter most to CIOs and chief risk officers — who authorised this agent, what data did it touch, what did it cost — with the transparency and auditability that regulated industries require."),
    pullquote('"We\'re moving from a world of historical reporting to one of continuous intelligence. Analytics will become more proactive and prescriptive, automating decisions and actions in real-time."'),
    p("Rounding out the suite is Tiger SCAI, the company's end-to-end Supply Chain AI platform. Available on both AWS Marketplace and Google Cloud, SCAI integrates generative AI, computer vision, graph databases, and reinforcement learning to deliver intelligence across the full supply chain spectrum — planning, sourcing, manufacturing, warehousing, logistics, and last-mile retail. In an era of persistent supply chain volatility, the value proposition is both clear and urgent."),
    p("Together, this suite of proprietary IP has transformed Tiger Analytics from a pure consulting firm into something more powerful: a full-stack AI partner with the domain depth of a specialist consultancy and the delivery velocity of a technology company."),

    // ── Section 4 ─────────────────────────────────────────────────────────────
    h2("Who are Tiger Analytics' strategic AI technology partners?"),
    p("One of the most telling indicators of a technology company's standing in its ecosystem is the quality of its strategic alliances — and Tiger Analytics' partner portfolio reads like a who's who of enterprise AI infrastructure."),
    p("In June 2025, Tiger Analytics was named Databricks Enterprise AI Partner of the Year at the Data + AI Summit — one of the most coveted recognitions in the AI services industry. The award acknowledged the firm's work implementing GenAI-powered assistants for the retail sector, automating claims adjudication for automotive insurance, and building centralised semantic layers for the insurance industry. It placed Tiger Analytics firmly at the leading edge of what is possible on the Databricks platform."),
    p("The company was also a Microsoft Partner of the Year Finalist in the Data and Analytics Platform category in 2025, reflecting its depth across Azure Synapse, Databricks, and Power BI. Tiger Analytics holds all three Azure Solutions Partner designations alongside three advanced specialisations — AI Platform on Microsoft Azure, Build AI Apps on Microsoft Azure, and Analytics on Microsoft Azure — a combination achieved by only a handful of global partners."),
    p("On the AWS side, a multi-year agreement positions Tiger Analytics as a GenAI solutions partner across finance, healthcare, manufacturing, and retail. In July 2025, its agentic AI solutions were listed in the new AWS Marketplace AI Agents and Tools category, extending enterprise-grade AI access at cloud scale. AWS DevOps Competency status followed in November 2025, building on the AWS Consumer Goods Competency earned the previous year."),
    p("The company's relationship with Google Cloud took a pivotal step forward in April 2025, when Tiger Analytics was named an official deployment partner for Google Cloud Agentspace — Google's enterprise AI agent platform. This places Tiger Analytics at the forefront of the shift from standalone AI models to interconnected, autonomous agent ecosystems — the defining architectural transition of the current AI era."),
    pullquote('"These partnerships represent shared bets on where enterprise AI is going — and a shared commitment to making that future accessible to the organisations that need it most."'),
    p("A January 2025 partnership with Zebra Technologies, focused on GenAI solutions for frontline worker productivity and customer experience, further signals Tiger Analytics' growing reach into retail operations and workforce intelligence, adding yet another dimension to what is already a formidable and diversified portfolio."),

    // ── Section 5 ─────────────────────────────────────────────────────────────
    h2("Recognition, Awards, and a Growing Global Footprint"),
    p("The industry's recognition of Tiger Analytics' work has been consistent and cumulative. The company has appeared on the Inc. 5000 list of America's fastest-growing companies multiple times — most recently in 2025, ranked 1,463rd with 298 percent three-year revenue growth. It has been named a Leader in Everest Group's Analytics and AI Services Specialists PEAK Matrix for consecutive years, and in October 2025 was designated an ISG Top Leader in Generative AI Services, covering Strategy, Consulting, Development, and Deployment."),
    p("Analytics India Magazine named Tiger Analytics among the Top 10 Workplaces for Data Science Professionals in 2025 — a recognition that reflects not just the quality of the work but the quality of the environment in which that work is done. The Great Place to Work certification and the Jombay WOW Workplace award reinforce this standing. In a market where competition for AI talent is fierce, Tiger Analytics' employer brand is a genuine competitive advantage."),
    p("Mahesh Kumar himself has been recognised as one of the 100 Most Influential AI Leaders in India by Analytics India Magazine in 2024, and was named among AIM's Top 20 CEOs of Data Science Service Providers in 2023. In March 2025, he was honoured with the Bihar Vishwa Gaurav Samman at the Consulate General of India in New York — an award presented to individuals of Bihar origin who have achieved distinction on the global stage."),
    pullquote('"Growing up in Bihar instilled in me a deep sense of resilience and curiosity. I hope it inspires young professionals and aspiring entrepreneurs from Bihar and beyond, encouraging them to pursue bold ideas and create meaningful impact."'),
    p("Today, Tiger Analytics operates from offices spanning Santa Clara, Chicago, London, Toronto, Mexico City, Singapore, Sydney, and four major cities across India — Chennai, Bengaluru, Hyderabad, and Delhi. Its global presence is not merely geographical; it is relational, built on long-standing client partnerships that span industries, continents, and the full spectrum of enterprise AI maturity."),

    // ── Section 6 ─────────────────────────────────────────────────────────────
    h2("Why did Tiger Analytics partner with the Bihar Government to train 50,000 AI professionals?"),
    p("As Tiger Analytics has grown into a global enterprise, Mahesh Kumar has become increasingly vocal about his responsibility not just to clients and stakeholders, but to the broader ecosystem from which he emerged — and to the young people in India who might follow a similar path."),
    p("In February 2026, that commitment became concrete when Tiger Analytics signed a landmark memorandum of understanding with the Government of Bihar and IIT Patna at the India-AI Impact Summit, organised by India's Ministry of Electronics and Information Technology. Under the agreement, Tiger Analytics will serve as the designated Industry Partner for a new AI Centre of Excellence in Bihar. The commitments are significant: training more than 50,000 young people, creating more than 10,000 jobs, and delivering large-scale AI upskilling programmes for students, working professionals, and government officials across the state."),
    pullquote('"Bihar has always been a powerhouse of intellectual talent. Collaboration between government, academia, and industry is key to ensuring AI becomes an engine of progress — not just for a few, but for all."'),
    p("The initiative is emblematic of a broader philosophy woven into Tiger Analytics' culture: that the purpose of AI is not simply to optimise corporate profits, but to democratise access to intelligence, capability, and opportunity. For Kumar — who earned a bronze medal at the International Mathematical Olympiad as a schoolboy from Bihar before going on to MIT and building a global company — that philosophy is deeply personal."),
    p("It also makes sound strategic sense. India's talent pool, particularly in STEM disciplines, remains one of the world's great untapped resources. By investing in the next generation of AI professionals at the source, Tiger Analytics is not just fulfilling a social responsibility — it is building the human infrastructure for its own next decade of growth."),

    // ── Section 7 ─────────────────────────────────────────────────────────────
    h2("What are Tiger Analytics' revenue goals and IPO plans for 2030?"),
    p("Tiger Analytics enters 2026 as arguably the world's most successful pure-play AI analytics firm by revenue. At an estimated $750 million, its revenues dwarf those of the nearest comparable competitors and reflect a business that has scaled without compromising the intellectual rigour or client-first ethos that defined it from day one. India operations for the financial year ending March 2025 grew at a 55 percent revenue CAGR — a figure that commands attention in any industry."),
    p("The target for 2026 is $500 million in revenues — a milestone that, if achieved, would represent one of the most remarkable growth trajectories in the global technology services industry. Beyond that, a billion dollars by 2030 is not aspirational rhetoric but a stated strategic objective, underpinned by investment in proprietary platforms, deepening cloud partnerships, and a relentless focus on attracting and retaining the best AI talent in the world."),
    p("An IPO is also on the horizon. Expected within the next two to three years, a public listing would represent both a validation of everything that has been built and a resource for what comes next. A potential headquarters relocation is also under consideration as part of that process."),
    pullquote('"Analytics is a journey, not a destination. The key is to start with a clear business goal, assemble the right team and tools, and then iterate and scale."'),
    p("For a company that has never raised a rupee of external funding, the journey to the public markets would be a fitting culmination of a philosophy that has always prioritised substance over optics, and long-term value over short-term performance. In an industry defined by hype cycles, Tiger Analytics has consistently delivered the one thing that hype cannot manufacture: results."),
    p("As the enterprise AI landscape continues its rapid evolution — from single-model implementations to multi-agent ecosystems, from descriptive analytics to continuous intelligence, from proof-of-concept to production at scale — Tiger Analytics is positioned not as a passenger in that transition, but as one of its principal architects. With Tiger Forge addressing the agentic AI frontier, Tiger SCAI transforming supply chain intelligence, and TigerML accelerating delivery across the full AI lifecycle, the company's product portfolio has never been better aligned with where enterprise demand is heading."),
    p("\"Ethics and governance will be critical as analytics scales across the enterprise,\" Kumar says. \"We need to make sure we're using data and algorithms in a responsible and unbiased way.\" This is not a hedge or a disclaimer — it is a conviction that underpins Tiger Analytics' entire approach to building AI systems that enterprises can trust, explain, and stand behind."),

    // ── Closing ───────────────────────────────────────────────────────────────
    h2("Why Tiger Analytics is the architect of the Enterprise AI era"),
    p("In the fourteen years since Mahesh Kumar and Pradeep Gulipalli founded Tiger Analytics on the belief that enterprises deserved better than dashboards and guesswork, the company has grown from a boutique consultancy into a global powerhouse — without ever losing the intellectual rigour and client-first ethos that defined it from the very beginning."),
    p("Tiger Analytics' story is, in many ways, the story of AI itself: from academic curiosity to enterprise imperative, from theoretical possibility to measurable business reality. And it is a story that is still being written — in the supply chains it has made more resilient, the revenue it has unlocked, the decisions it has made clearer, and the careers it is building among the next generation of data scientists across India and the world."),
    p("With an industry-leading partner ecosystem, a growing suite of proprietary AI platforms, a pipeline of high-impact client engagements spanning five continents, and a founder who combines world-class academic credentials with the pragmatism of a lifelong builder, Tiger Analytics is not merely well-positioned for the age of AI."),
    p("It is, in many meaningful respects, defining it."),
  ];
  // ── Step 3: Create the CSA document ────────────────────────────────────────
  console.log('\n🚀 Creating CSA article in Sanity...');

  const doc = {
    _type: 'csa',
    title: "The Certainty Code: How Mahesh Kumar Built Tiger Analytics Into a $750M AI Powerhouse",
    slug: { _type: 'slug', current: 'mahesh-kumar-tiger-analytics' },
    excerpt: "From a modest Santa Clara office in 2011 to a $750 million global AI firm serving 70 percent of the Fortune 1,000, Mahesh Kumar's Tiger Analytics has redefined what enterprise AI can achieve — and is only getting started.",
    publishedAt: new Date().toISOString(),
    writer: { _type: 'reference', _ref: WRITER_ID },
    contributorName: 'CSuite Editorial Team',
    // Hero image shown at top of article page
    mainImage: {
      _type: 'image',
      asset: { _type: 'reference', _ref: heroAsset._id },
      alt: 'Mahesh Kumar, Founder and CEO, Tiger Analytics',
    },
    // Portrait image used in the spotlight grid on homepage
    spotlightImage: {
      _type: 'image',
      asset: { _type: 'reference', _ref: portraitAsset._id },
      alt: 'Mahesh Kumar, Founder and CEO, Tiger Analytics',
    },
    body,
  };

  
  const existing = await client.fetch('*[_type=="csa" && slug.current=="mahesh-kumar-tiger-analytics"][0]');
  if (!existing) throw new Error("Article not found");
  console.log("Patching AEO arrays to document " + existing._id);
  const result = await client.patch(existing._id).set({ body: doc.body }).commit();

  console.log(`  ✅ Article created: ${result._id}`);
  console.log(`     Title:   ${result.title}`);
  console.log(`     Preview: http://localhost:3000/csa/${doc.slug.current}`);

  // ── Step 4: Update spotlight grid ──────────────────────────────────────────
  console.log('\n🔄 Updating spotlight grid...');

  // Fetch Sukhinder's document ID
  const sukhinderDoc = await client.fetch(`*[_type == "csa" && title match "Sukhinder"][0]{_id, title}`);
  if (!sukhinderDoc) throw new Error('Could not find Sukhinder CSA document');
  console.log(`  Found Sukhinder: ${sukhinderDoc._id}`);

  // Fetch the spotlight config
  const config = await client.fetch(`*[_type == "spotlightConfig"][0]`);
  if (!config || !config.items) throw new Error('Could not find spotlightConfig');

  // Find Sukhinder's current index
  const sukhinderIndex = config.items.findIndex(item => item._ref === sukhinderDoc._id);
  if (sukhinderIndex === -1) throw new Error('Sukhinder not found in spotlight grid items');
  console.log(`  Sukhinder is currently at spotlight index ${sukhinderIndex}`);

  // Build new items: insert Tiger Analytics at Sukhinder's index, shifting her down
  const tigerItem = {
    _key: `${result._id}-spotlight`,
    _type: 'reference',
    _ref: result._id,
  };

  const newItems = [...config.items];
  newItems.splice(sukhinderIndex, 0, tigerItem);

  await client.patch(config._id).set({ items: newItems }).commit();

  console.log(`  ✅ Tiger Analytics inserted at spotlight index ${sukhinderIndex}`);
  console.log(`  ✅ Sukhinder shifted to index ${sukhinderIndex + 1}`);
  console.log('\n✨ All done!');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
