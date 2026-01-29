#!/usr/bin/env node

/**
 * Content Audit Script for SEO Compliance
 * Analyzes all articles to identify original vs potentially spun/duplicate content
 * 
 * Usage: node scripts/audit-content-originality.js
 */

const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2025-01-01',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN
});

// Colors for output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Extract unique phrases from text (for Google search testing)
function extractUniquePhrases(text, count = 3) {
    if (!text) return [];

    // Remove common words and extract meaningful phrases
    const sentences = text.split(/[.!?]\s+/);
    const phrases = [];

    for (const sentence of sentences) {
        const words = sentence.trim().split(/\s+/);
        if (words.length >= 10 && words.length <= 20) {
            // Extract 10-15 word phrases (good for duplicate detection)
            phrases.push(words.slice(0, 15).join(' '));
            if (phrases.length >= count) break;
        }
    }

    return phrases;
}

// Analyze article for originality signals
function analyzeArticle(post) {
    const signals = {
        original: 0,
        spun: 0,
        unclear: 0,
        indicators: []
    };

    // Positive signals (original content)
    if (post.categories?.some(cat => cat.slug?.current?.includes('interview'))) {
        signals.original += 2;
        signals.indicators.push('✅ Interview category');
    }

    if (post.categories?.some(cat => cat.slug?.current?.includes('cxo') || cat.slug?.current?.includes('spotlight'))) {
        signals.original += 2;
        signals.indicators.push('✅ CXO/Spotlight category');
    }

    if (post.writer?.name && !post.writer.name.includes('Team') && !post.writer.name.includes('Editorial')) {
        signals.original += 1;
        signals.indicators.push(`✅ Specific author: ${post.writer.name}`);
    }

    if (post.mainImage?.asset) {
        signals.original += 0.5;
        signals.indicators.push('✅ Has main image');
    }

    // Check for executive names in title
    const titleHasNames = /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/.test(post.title || '');
    if (titleHasNames) {
        signals.original += 1;
        signals.indicators.push('✅ Title contains person names');
    }

    // Negative signals (potentially spun)
    if (!post.writer || post.writer.name?.includes('Editorial Team')) {
        signals.spun += 1;
        signals.indicators.push('⚠️ Generic/no author');
    }

    const genericWords = ['leadership', 'strategy', 'innovation', 'success', 'tips', 'ways to'];
    const titleLower = (post.title || '').toLowerCase();
    const hasGenericTitle = genericWords.some(word => titleLower.includes(word)) && !titleHasNames;

    if (hasGenericTitle) {
        signals.spun += 1;
        signals.indicators.push('⚠️ Generic title without specific names');
    }

    if (!post.excerpt || post.excerpt.length < 100) {
        signals.unclear += 0.5;
        signals.indicators.push('❓ Missing/short excerpt');
    }

    // Word count check
    const bodyText = extractTextFromPortableText(post.body);
    const wordCount = bodyText.split(/\s+/).length;

    if (wordCount < 500) {
        signals.spun += 1;
        signals.indicators.push(`⚠️ Short article (${wordCount} words)`);
    } else if (wordCount > 1500) {
        signals.original += 1;
        signals.indicators.push(`✅ Substantial article (${wordCount} words)`);
    }

    return {
        ...signals,
        wordCount,
        bodyText: bodyText.substring(0, 1000) // First 1000 chars for phrase extraction
    };
}

// Extract plain text from Portable Text
function extractTextFromPortableText(body) {
    if (!body || !Array.isArray(body)) return '';

    return body
        .filter(block => block._type === 'block')
        .map(block => {
            if (!block.children) return '';
            return block.children
                .filter(child => child._type === 'span')
                .map(child => child.text || '')
                .join(' ');
        })
        .join(' ');
}

// Categorize article based on signals
function categorizeArticle(analysis) {
    const score = analysis.original - analysis.spun;

    if (score >= 3) {
        return { category: 'original', confidence: 'high', color: 'green' };
    } else if (score >= 1) {
        return { category: 'original', confidence: 'medium', color: 'cyan' };
    } else if (score <= -2) {
        return { category: 'spun', confidence: 'high', color: 'red' };
    } else if (score <= 0) {
        return { category: 'spun', confidence: 'medium', color: 'yellow' };
    } else {
        return { category: 'unclear', confidence: 'low', color: 'magenta' };
    }
}

async function runAudit() {
    log('\n🔍 Content Originality Audit', 'blue');
    log('='.repeat(60), 'blue');
    log('Analyzing all articles for duplicate/spun content...\n', 'cyan');

    try {
        // Fetch all published articles
        const posts = await client.fetch(`
      *[_type == "post" && defined(slug.current)] | order(_createdAt desc) {
        _id,
        title,
        slug,
        excerpt,
        body,
        publishedAt,
        _createdAt,
        mainImage {
          asset
        },
        "writer": *[_type == "writer" && _id == ^.writer._ref][0] {
          name
        },
        "categories": categories[]-> {
          title,
          slug
        }
      }
    `);

        log(`Found ${posts.length} articles\n`, 'blue');

        const results = {
            original: [],
            spun: [],
            unclear: [],
            stats: {
                total: posts.length,
                originalCount: 0,
                spunCount: 0,
                unclearCount: 0
            }
        };

        // Analyze each article
        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            process.stdout.write(`Analyzing ${i + 1}/${posts.length}: ${post.title?.substring(0, 50)}... `);

            const analysis = analyzeArticle(post);
            const classification = categorizeArticle(analysis);

            const result = {
                title: post.title,
                slug: post.slug.current,
                url: `https://csuitemagazine.global/category/${post.categories?.[0]?.slug?.current}/${post.slug.current}`,
                publishedAt: post.publishedAt || post._createdAt,
                wordCount: analysis.wordCount,
                category: classification.category,
                confidence: classification.confidence,
                indicators: analysis.indicators,
                testPhrases: extractUniquePhrases(analysis.bodyText, 2)
            };

            results[classification.category].push(result);
            results.stats[`${classification.category}Count`]++;

            log(`[${classification.category.toUpperCase()}]`, classification.color);
        }

        // Generate report
        log('\n' + '='.repeat(60), 'blue');
        log('📊 AUDIT RESULTS', 'blue');
        log('='.repeat(60) + '\n', 'blue');

        log(`Total Articles: ${results.stats.total}`, 'cyan');
        log(`✅ Original Content: ${results.stats.originalCount} (${((results.stats.originalCount / results.stats.total) * 100).toFixed(1)}%)`, 'green');
        log(`⚠️  Potentially Spun: ${results.stats.spunCount} (${((results.stats.spunCount / results.stats.total) * 100).toFixed(1)}%)`, 'red');
        log(`❓ Unclear: ${results.stats.unclearCount} (${((results.stats.unclearCount / results.stats.total) * 100).toFixed(1)}%)\n`, 'yellow');

        // Detailed breakdown
        if (results.original.length > 0) {
            log('\n✅ ORIGINAL CONTENT (Safe to Keep)', 'green');
            log('-'.repeat(60), 'green');
            results.original.forEach((article, idx) => {
                log(`\n${idx + 1}. ${article.title}`, 'green');
                log(`   URL: ${article.url}`, 'cyan');
                log(`   Words: ${article.wordCount} | Confidence: ${article.confidence}`, 'cyan');
                article.indicators.forEach(ind => log(`   ${ind}`, 'reset'));
            });
        }

        if (results.spun.length > 0) {
            log('\n\n⚠️  POTENTIALLY SPUN CONTENT (Review Required)', 'red');
            log('-'.repeat(60), 'red');
            results.spun.forEach((article, idx) => {
                log(`\n${idx + 1}. ${article.title}`, 'red');
                log(`   URL: ${article.url}`, 'cyan');
                log(`   Words: ${article.wordCount} | Confidence: ${article.confidence}`, 'cyan');
                article.indicators.forEach(ind => log(`   ${ind}`, 'reset'));

                if (article.testPhrases.length > 0) {
                    log(`   \n   🔍 Test for duplicates on Google:`, 'yellow');
                    article.testPhrases.forEach(phrase => {
                        log(`   "${phrase.substring(0, 80)}..."`, 'yellow');
                    });
                }
            });
        }

        if (results.unclear.length > 0) {
            log('\n\n❓ UNCLEAR STATUS (Manual Review Needed)', 'magenta');
            log('-'.repeat(60), 'magenta');
            results.unclear.forEach((article, idx) => {
                log(`\n${idx + 1}. ${article.title}`, 'magenta');
                log(`   URL: ${article.url}`, 'cyan');
                log(`   Words: ${article.wordCount}`, 'cyan');
                article.indicators.forEach(ind => log(`   ${ind}`, 'reset'));
            });
        }

        // Recommendations
        log('\n\n📋 RECOMMENDATIONS', 'blue');
        log('='.repeat(60), 'blue');

        if (results.stats.spunCount > 0) {
            const spunPercentage = (results.stats.spunCount / results.stats.total * 100).toFixed(1);
            log(`\n⚠️  ${spunPercentage}% of content may be spun/duplicate`, 'red');
            log('   Actions:', 'yellow');
            log('   1. Manually test flagged phrases on Google', 'yellow');
            log('   2. Remove articles found elsewhere with earlier publish dates', 'yellow');
            log('   3. Or: Add proper attribution if curating content', 'yellow');
        }

        if (results.stats.originalCount > 0) {
            log(`\n✅ ${results.stats.originalCount} original articles - Focus SEO here!`, 'green');
            log('   Actions:', 'cyan');
            log('   1. Optimize these for CEO names + company names', 'cyan');
            log('   2. Add internal links between original articles', 'cyan');
            log('   3. Promote these on social media', 'cyan');
        }

        const qualityRatio = results.stats.originalCount / results.stats.total;
        log(`\n📊 Content Quality Ratio: ${(qualityRatio * 100).toFixed(1)}%`, 'blue');

        if (qualityRatio >= 0.7) {
            log('   ✅ EXCELLENT - Safe to pursue aggressive SEO', 'green');
        } else if (qualityRatio >= 0.5) {
            log('   ⚠️  MODERATE - Clean up spun content before heavy SEO', 'yellow');
        } else {
            log('   ❌ RISKY - Significant cleanup needed to avoid penalties', 'red');
        }

        // Export detailed report
        const fs = require('fs');
        const reportPath = 'content-audit-report.json';
        fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
        log(`\n💾 Detailed report saved to: ${reportPath}`, 'cyan');

    } catch (error) {
        log(`\n❌ Error: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    }
}

runAudit();
