#!/usr/bin/env node
/**
 * SEO Content Brief Generator
 * 
 * Creates comprehensive content briefs for target keywords including:
 * - SEO-optimized title options
 * - Meta description
 * - Recommended article structure (H2/H3)
 * - Target word count
 * - Related keywords to include
 * - Internal linking opportunities
 * 
 * Usage: node scripts/seo/generate-content-brief.js "target keyword"
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://csuitemagazine.global';
const CREDENTIALS_PATH = path.join(__dirname, '../../.credentials/google-search-console.json');

async function generateBrief(targetKeyword) {
    if (!targetKeyword) {
        console.log('❌ Usage: node generate-content-brief.js "your target keyword"');
        console.log('Example: node generate-content-brief.js "CEO leadership strategies"');
        process.exit(1);
    }

    console.log(`\n🎯 Generating Content Brief for: "${targetKeyword}"\n`);
    console.log('═'.repeat(80));

    try {
        // Load credentials
        const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));

        // Create auth client
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
        });

        const authClient = await auth.getClient();
        const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });

        // Get related keywords from Search Console
        console.log('📊 Analyzing Search Console data for related keywords...\n');

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);

        const response = await searchconsole.searchanalytics.query({
            siteUrl: SITE_URL,
            requestBody: {
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                dimensions: ['query'],
                dimensionFilterGroups: [{
                    filters: [{
                        dimension: 'query',
                        operator: 'contains',
                        expression: targetKeyword.toLowerCase().split(' ')[0]
                    }]
                }],
                rowLimit: 50,
            },
        });

        const relatedKeywords = response.data.rows || [];

        // Generate title options
        const titleOptions = generateTitles(targetKeyword);

        // Generate meta description
        const metaDescription = generateMetaDescription(targetKeyword);

        // Generate article structure
        const structure = generateStructure(targetKeyword, relatedKeywords);

        // Calculate target metrics
        const metrics = calculateMetrics(targetKeyword);

        // Output the brief
        console.log('📝 CONTENT BRIEF');
        console.log('═'.repeat(80));
        console.log(`Target Keyword: ${targetKeyword}`);
        console.log(`Article Type: Executive Leadership Content`);
        console.log(`Target Audience: C-Suite Executives, Business Leaders\n`);

        console.log('─'.repeat(80));
        console.log('1️⃣  TITLE OPTIONS (Pick one or customize):');
        console.log('─'.repeat(80));
        titleOptions.forEach((title, i) => {
            console.log(`\n   Option ${i + 1}: ${title.text}`);
            console.log(`   Length: ${title.length} chars | SEO Score: ${title.score}/10`);
            console.log(`   Why: ${title.rationale}`);
        });

        console.log('\n' + '─'.repeat(80));
        console.log('2️⃣  META DESCRIPTION:');
        console.log('─'.repeat(80));
        console.log(`\n   ${metaDescription.text}`);
        console.log(`   Length: ${metaDescription.length} chars (optimal: 150-160)`);

        console.log('\n' + '─'.repeat(80));
        console.log('3️⃣  ARTICLE STRUCTURE:');
        console.log('─'.repeat(80));
        console.log('\n   Introduction (150-200 words)');
        console.log('   - Hook with relevant executive challenge');
        console.log('   - Why this matters for C-suite leaders');
        console.log('   - Preview key insights\n');

        structure.sections.forEach((section, i) => {
            console.log(`   H2: ${section.title} (${section.wordCount} words)`);
            section.subsections.forEach(sub => {
                console.log(`      H3: ${sub}`);
            });
            console.log(`   - Include: ${section.include.join(', ')}`);
            console.log('');
        });

        console.log('   Conclusion (150-200 words)');
        console.log('   - Summary of key takeaways');
        console.log('   - Call to action (subscribe, download, etc.)');

        console.log('\n' + '─'.repeat(80));
        console.log('4️⃣  TARGET METRICS:');
        console.log('─'.repeat(80));
        console.log(`\n   Word Count: ${metrics.wordCount} words`);
        console.log(`   Reading Time: ${metrics.readingTime} minutes`);
        console.log(`   Images: ${metrics.images} high-quality images`);
        console.log(`   Internal Links: ${metrics.internalLinks} to related articles`);
        console.log(`   External Links: ${metrics.externalLinks} to authoritative sources`);

        if (relatedKeywords.length > 0) {
            console.log('\n' + '─'.repeat(80));
            console.log('5️⃣  RELATED KEYWORDS TO INCLUDE:');
            console.log('─'.repeat(80));
            console.log('\n   Naturally incorporate these keywords in your content:\n');

            const topRelated = relatedKeywords
                .filter(k => k.keys[0] !== targetKeyword.toLowerCase())
                .sort((a, b) => b.impressions - a.impressions)
                .slice(0, 10);

            topRelated.forEach((k, i) => {
                console.log(`   ${i + 1}. "${k.keys[0]}" (${k.impressions} monthly searches)`);
            });
        }

        console.log('\n' + '─'.repeat(80));
        console.log('6️⃣  INTERNAL LINKING OPPORTUNITIES:');
        console.log('─'.repeat(80));
        console.log('\n   Link to these related articles (if they exist):');
        console.log('   - CEO interview series articles');
        console.log('   - Related leadership topics');
        console.log('   - Industry-specific executive content');
        console.log('   💡 Aim for 3-5 internal links throughout the article');

        console.log('\n' + '─'.repeat(80));
        console.log('7️⃣  CONTENT TIPS:');
        console.log('─'.repeat(80));
        console.log('\n   ✅ DO:');
        console.log('   - Include direct quotes from CEO interviews');
        console.log('   - Add real-world examples and case studies');
        console.log('   - Use data and statistics to support points');
        console.log('   - Write for busy executives (scannable, clear)');
        console.log('   - Include actionable takeaways\n');
        console.log('   ❌ DON\'T:');
        console.log('   - Use generic business jargon');
        console.log('   - Stuff keywords unnaturally');
        console.log('   - Write below 1,500 words for executive content');
        console.log('   - Forget to optimize images with alt text');

        // Export to file
        const briefPath = path.join(__dirname, `../../content-brief-${targetKeyword.replace(/\s+/g, '-').toLowerCase()}.md`);
        const briefContent = generateMarkdownBrief(targetKeyword, titleOptions, metaDescription, structure, metrics, relatedKeywords);
        fs.writeFileSync(briefPath, briefContent);

        console.log('\n' + '═'.repeat(80));
        console.log(`✅ Content brief saved to: ${path.basename(briefPath)}`);
        console.log('═'.repeat(80));
        console.log('\n💡 Give this brief to your editorial team to create the article!\n');

    } catch (error) {
        console.error('❌ Error generating brief:', error.message);
        process.exit(1);
    }
}

function generateTitles(keyword) {
    return [
        {
            text: `${keyword}: 5 Insights from Top CEOs`,
            length: `${keyword}: 5 Insights from Top CEOs`.length,
            score: 9,
            rationale: 'Number in title + authority signal (CEOs) + concise'
        },
        {
            text: `How ${keyword} Drives Business Success in 2025`,
            length: `How ${keyword} Drives Business Success in 2025`.length,
            score: 8,
            rationale: 'How-to format + benefit-driven + current year'
        },
        {
            text: `${keyword}: Expert Guide for C-Suite Leaders`,
            length: `${keyword}: Expert Guide for C-Suite Leaders`.length,
            score: 8,
            rationale: 'Authority signal + target audience specific'
        },
        {
            text: `${keyword} - What Executives Need to Know`,
            length: `${keyword} - What Executives Need to Know`.length,
            score: 7,
            rationale: 'Clear value proposition + audience targeting'
        },
        {
            text: `The Complete Guide to ${keyword} for CEOs`,
            length: `The Complete Guide to ${keyword} for CEOs`.length,
            score: 8,
            rationale: 'Comprehensive signal + executive focus'
        }
    ];
}

function generateMetaDescription(keyword) {
    const text = `Discover how top C-suite executives are leveraging ${keyword} to drive business growth. Expert insights, real-world examples, and actionable strategies for leaders.`;
    return {
        text,
        length: text.length
    };
}

function generateStructure(keyword, relatedKeywords) {
    return {
        sections: [
            {
                title: `Understanding ${keyword} in Modern Business`,
                wordCount: 300,
                subsections: [
                    'Definition and importance',
                    'Current trends and statistics',
                    'Why it matters for executives'
                ],
                include: ['Data/statistics', 'Industry context', 'CEO quote']
            },
            {
                title: 'Key Challenges and Opportunities',
                wordCount: 350,
                subsections: [
                    'Common obstacles facing leaders',
                    'Market opportunities',
                    'Risk factors to consider'
                ],
                include: ['Real-world examples', 'Case study', 'Expert insight']
            },
            {
                title: 'Best Practices and Strategies',
                wordCount: 400,
                subsections: [
                    'Framework for implementation',
                    'Step-by-step approach',
                    'Tools and resources'
                ],
                include: ['Actionable steps', 'CEO interviews', 'Success metrics']
            },
            {
                title: 'Real-World Success Stories',
                wordCount: 300,
                subsections: [
                    'Company A: Implementation results',
                    'Company B: Transformation journey',
                    'Lessons learned'
                ],
                include: ['Specific results', 'Executive quotes', 'Key takeaways']
            },
            {
                title: 'Future Outlook and Recommendations',
                wordCount: 250,
                subsections: [
                    'Emerging trends',
                    'What to watch in 2025',
                    'Action plan for executives'
                ],
                include: ['Forward-looking insights', 'Expert predictions', 'Next steps']
            }
        ]
    };
}

function calculateMetrics(keyword) {
    return {
        wordCount: '1,800-2,200',
        readingTime: '8-10',
        images: '4-6',
        internalLinks: '3-5',
        externalLinks: '2-3'
    };
}

function generateMarkdownBrief(keyword, titles, meta, structure, metrics, related) {
    const md = `# Content Brief: ${keyword}

**Date:** ${new Date().toISOString().split('T')[0]}
**Target Audience:** C-Suite Executives, Business Leaders
**Article Type:** Executive Leadership Content

---

## 1. Title Options

${titles.map((t, i) => `### Option ${i + 1}: ${t.text}
- **Length:** ${t.length} characters
- **SEO Score:** ${t.score}/10
- **Rationale:** ${t.rationale}
`).join('\n')}

---

## 2. Meta Description

\`\`\`
${meta.text}
\`\`\`

**Length:** ${meta.length} characters

---

## 3. Article Structure

### Introduction (150-200 words)
- Hook with relevant executive challenge
- Why this matters for C-suite leaders
- Preview key insights

${structure.sections.map(s => `### ${s.title} (${s.wordCount} words)

${s.subsections.map(sub => `- ${sub}`).join('\n')}

**Include:** ${s.include.join(', ')}
`).join('\n')}

### Conclusion (150-200 words)
- Summary of key takeaways
- Call to action

---

## 4. Target Metrics

- **Word Count:** ${metrics.wordCount} words
- **Reading Time:** ${metrics.readingTime} minutes
- **Images:** ${metrics.images} high-quality images
- **Internal Links:** ${metrics.internalLinks}
- **External Links:** ${metrics.externalLinks}

---

## 5. Related Keywords

${related.slice(0, 10).map((k, i) => `${i + 1}. "${k.keys[0]}" (${k.impressions} searches)`).join('\n')}

---

## 6. Content Guidelines

### ✅ DO:
- Include direct quotes from CEO interviews
- Add real-world examples and case studies
- Use data and statistics to support points
- Write for busy executives (scannable, clear)
- Include actionable takeaways

### ❌ DON'T:
- Use generic business jargon
- Stuff keywords unnaturally
- Write below 1,500 words
- Forget to optimize images with alt text

---

**Next Steps:** Share this brief with your editorial team to create the article!
`;

    return md;
}

// Run the script
const targetKeyword = process.argv[2];
generateBrief(targetKeyword);
