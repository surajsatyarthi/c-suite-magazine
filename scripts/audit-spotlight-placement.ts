import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { createClient } from '@sanity/client';
import { config } from '../sanity/config';

const client = createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion,
    useCdn: false,
    token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
});

async function auditSpotlightPlacement() {
    console.log('🔍 COMPREHENSIVE SPOTLIGHT PLACEMENT AUDIT\n');
    console.log('='.repeat(100));
    console.log('\n📋 BUSINESS REQUIREMENTS:\n');
    console.log('   • 1 Executive in Focus slot (highest paying client)');
    console.log('   • 12 Spotlight grid slots (next tier)');
    console.log('   • Revenue-driven placement');
    console.log('   • Both CSA and regular articles eligible\n');
    console.log('='.repeat(100));

    try {
        // 1. Check public/spotlight.json (current source of truth for homepage)
        console.log('\n1️⃣  CURRENT HOMEPAGE CONFIGURATION (public/spotlight.json)\n');
        const spotlightPath = path.join(process.cwd(), 'public', 'spotlight.json');
        const spotlightContent = JSON.parse(fs.readFileSync(spotlightPath, 'utf-8'));

        console.log(`   Total items in file: ${spotlightContent.length}`);

        // Find Rich Stinson (Executive in Focus)
        const executiveInFocus = spotlightContent.find((item: any) =>
            item.title === 'Rich Stinson' || item.href?.includes('rich-stinson')
        );

        console.log(`\n   Executive in Focus:`);
        if (executiveInFocus) {
            console.log(`   ✅ ${executiveInFocus.title}`);
            console.log(`      URL: ${executiveInFocus.href}`);
        } else {
            console.log(`   ⚠️  No clear Executive in Focus found`);
        }

        // Grid items (excluding Executive in Focus)
        const gridItems = spotlightContent.filter((item: any) =>
            item.title !== 'Rich Stinson' && !item.href?.includes('rich-stinson')
        );

        console.log(`\n   Spotlight Grid:`);
        console.log(`   Total eligible: ${gridItems.length}`);
        console.log(`   Will display: 12 (code default)\n`);

        gridItems.slice(0, 12).forEach((item: any, i: number) => {
            console.log(`   ${i + 1}. ${item.title || 'Generic Title'} - ${item.href?.split('/').pop()}`);
        });

        if (gridItems.length > 12) {
            console.log(`\n   ⚠️  ${gridItems.length - 12} articles NOT displayed (positions 13+):`);
            gridItems.slice(12).forEach((item: any, i: number) => {
                console.log(`      ${13 + i}. ${item.title} - ${item.href?.split('/').pop()}`);
            });
        }

        // 2. Check Sanity configuration
        console.log('\n' + '='.repeat(100));
        console.log('\n2️⃣  SANITY CONFIGURATION (spotlightConfig)\n');

        const sanitySpotlight = await client.fetch(`*[_id == "spotlightConfig"][0] {
            cardCount,
            items[]-> {
                _id,
                _type,
                title,
                slug,
                "categories": categories[]->title
            }
        }`);

        console.log(`   cardCount setting: ${sanitySpotlight.cardCount}`);
        console.log(`   Total articles: ${sanitySpotlight.items.length}\n`);

        // 3. Check for CSA articles
        console.log('='.repeat(100));
        console.log('\n3️⃣  CSA (COMPANY SPONSORED ARTICLES) ANALYSIS\n');

        const csaArticles = await client.fetch(`*[_type == "csa"] {
            _id,
            title,
            slug,
            "categories": categories[]->title,
            publishedAt
        }`);

        console.log(`   Total CSA articles in system: ${csaArticles.length}\n`);

        if (csaArticles.length > 0) {
            csaArticles.forEach((csa: any, i: number) => {
                console.log(`   ${i + 1}. ${csa.title}`);
                console.log(`      Slug: ${csa.slug?.current}`);
                console.log(`      Categories: ${csa.categories?.join(', ')}`);

                // Check if in spotlight
                const inSanitySpotlight = sanitySpotlight.items.some((item: any) => item._id === csa._id);
                const inStaticFile = spotlightContent.some((item: any) =>
                    item.href?.includes(csa.slug?.current)
                );

                console.log(`      In Sanity spotlight: ${inSanitySpotlight ? '✅' : '❌'}`);
                console.log(`      In static file: ${inStaticFile ? '✅' : '❌'}\n`);
            });
        } else {
            console.log('   ℹ️  No CSA articles found\n');
        }

        // 4. Gap Analysis
        console.log('='.repeat(100));
        console.log('\n4️⃣  GAP ANALYSIS & ISSUES\n');

        const issues = [];

        // Issue 1: Static file vs Sanity mismatch
        if (spotlightContent.length !== sanitySpotlight.items.length) {
            issues.push({
                severity: 'HIGH',
                issue: `Static file has ${spotlightContent.length} items, Sanity has ${sanitySpotlight.items.length}`,
                impact: 'Homepage not reflecting Sanity data'
            });
        }

        // Issue 2: More than 13 total
        const totalConfigured = executiveInFocus ? gridItems.length + 1 : gridItems.length;
        if (totalConfigured !== 13) {
            issues.push({
                severity: 'MEDIUM',
                issue: `Total configured: ${totalConfigured} (should be 13: 1 Executive + 12 grid)`,
                impact: 'Not aligned with business model'
            });
        }

        // Issue 3: CSA placement
        if (csaArticles.length > 0) {
            const csaInSpotlight = csaArticles.filter((csa: any) =>
                spotlightContent.some((item: any) => item.href?.includes(csa.slug?.current))
            );

            if (csaInSpotlight.length !== csaArticles.length) {
                issues.push({
                    severity: 'CRITICAL',
                    issue: `${csaArticles.length - csaInSpotlight.length} CSA articles NOT in homepage spotlight`,
                    impact: 'Revenue loss - paid clients not getting visibility'
                });
            }
        }

        if (issues.length === 0) {
            console.log('   ✅ No critical issues found\n');
        } else {
            issues.forEach((issue, i) => {
                console.log(`   ${i + 1}. [${issue.severity}] ${issue.issue}`);
                console.log(`      Impact: ${issue.impact}\n`);
            });
        }

        // 5. Recommendations
        console.log('='.repeat(100));
        console.log('\n5️⃣  RECOMMENDATIONS\n');

        console.log('   1. Source of Truth: Choose one');
        console.log('      • Option A: Use public/spotlight.json (manual control)');
        console.log('      • Option B: Use Sanity spotlightConfig (dynamic management)\n');

        console.log('   2. Ensure Total = 13');
        console.log('      • 1 Executive in Focus');
        console.log('      • 12 Spotlight grid\n');

        console.log('   3. CSA Priority');
        console.log('      • All CSA articles MUST be in the 13 slots');
        console.log('      • Top-paying CSA gets Executive in Focus\n');

        console.log('   4. Update Logic');
        console.log('      • Remove hardcoded 12 limit if using 13 total');
        console.log('      • Implement revenue-based ordering\n');

        console.log('='.repeat(100));
        console.log('\n');

    } catch (error) {
        console.error('Error:', error);
    }
}

auditSpotlightPlacement();
