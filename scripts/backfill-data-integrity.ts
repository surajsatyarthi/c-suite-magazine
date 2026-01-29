import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { createClient } from '@sanity/client';
import { config } from '../sanity/config';
import { calculateReadingTime } from '../lib/calculateReadingTime';
import { getHeroTagline } from '../lib/articleHelpers';
import { articleImageService } from '../lib/articleImageService';
import fs from 'fs';
import https from 'https';

// Verify write token is available
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN;
if (!token) {
    console.error('❌ Error: SANITY_WRITE_TOKEN or SANITY_API_TOKEN is required');
    process.exit(1);
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

if (!projectId || !token) {
    console.error('❌ Error: NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_WRITE_TOKEN are required');
    process.exit(1);
}

const client = createClient({
    projectId,
    dataset,
    apiVersion: '2024-10-01',
    useCdn: false,
    token,
});

interface Article {
    _id: string;
    _type: string;
    title: string;
    slug: { current: string };
    body: any[];
    categories?: any[];
    tags?: string[];
    mainImage?: any;
    readTime?: number;
    heroTagline?: string;
}

/**
 * Downloads an image from a URL to a temporary file
 */
async function downloadImage(url: string, filename: string): Promise<string> {
    const tempDir = path.join(__dirname, '../tmp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    const filePath = path.join(tempDir, filename);

    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(filePath);
            });
        }).on('error', (err) => {
            fs.unlink(filePath, () => {});
            reject(err);
        });
    });
}

async function backfillDataIntegrity(options: { dryRun?: boolean; limit?: number } = {}) {
    const { dryRun = false, limit } = options;

    console.log('🚀 Starting Data Integrity Backfill (Issue #21, #22)\n');
    console.log(`Mode: ${dryRun ? '🔍 DRY RUN' : '✍️  LIVE UPDATE'}\n`);

    try {
        // Query for articles missing metadata or images
        // We check for !defined(readTime) OR !defined(heroTagline) OR !defined(mainImage)
        const query = `*[_type in ["post", "csa"] && !(_id in path("drafts.**"))] {
            _id,
            _type,
            title,
            slug,
            body,
            categories[]->{ title, slug },
            tags,
            mainImage,
            readTime,
            heroTagline
        }${limit ? `[0...${limit}]` : ''}`;

        const articles: Article[] = await client.fetch(query);
        console.log(`Analyzing ${articles.length} articles...\n`);

        const updates: any[] = [];

        for (const article of articles) {
            const patch: any = {};
            let changed = false;

            // 1. Reading Time
            if (!article.readTime) {
                const rt = calculateReadingTime(article.body);
                patch.readTime = rt;
                changed = true;
            }

            // 2. Hero Tagline
            if (!article.heroTagline) {
                const tagline = getHeroTagline(article as any);
                if (tagline) {
                    patch.heroTagline = tagline;
                    changed = true;
                }
            }

            // 3. Images (Permanent Fix for Issue #22)
            if (!article.mainImage || !article.mainImage.asset) {
                console.log(`🖼️  Generating image for: "${article.title}"...`);
                const imageUrl = await articleImageService.generateUniqueImage(article as any);
                if (imageUrl && !dryRun) {
                    try {
                        const tempPath = await downloadImage(imageUrl, `temp-${article._id}.png`);
                        const asset = await client.assets.upload('image', fs.createReadStream(tempPath), {
                            filename: `auto-${article.slug.current}.png`,
                            contentType: 'image/png'
                        });
                        patch.mainImage = {
                            _type: 'image',
                            asset: { _type: 'reference', _ref: asset._id },
                            alt: article.title
                        };
                        changed = true;
                        fs.unlinkSync(tempPath);
                    } catch (err) {
                        console.error(`❌ Failed to upload image for ${article.title}:`, err);
                    }
                } else if (imageUrl && dryRun) {
                    console.log(`🔍 [DRY RUN] Would generate and upload: ${imageUrl}`);
                }
            }

            if (changed) {
                updates.push({ id: article._id, patch, title: article.title });
            }
        }

        console.log(`\nFound ${updates.length} articles requiring updates.\n`);

        if (dryRun) {
            updates.forEach(u => console.log(`- [UPDATE] ${u.title}: ${JSON.stringify(u.patch)}`));
            return;
        }

        // Apply updates in batches
        const BATCH_SIZE = 5;
        for (let i = 0; i < updates.length; i += BATCH_SIZE) {
            const batch = updates.slice(i, i + BATCH_SIZE);
            const transaction = client.transaction();
            batch.forEach(u => transaction.patch(u.id, { set: u.patch }));
            await transaction.commit();
            console.log(`✅ Progress: ${i + batch.length}/${updates.length} updated`);
        }

        console.log('\n🎉 Data Integrity Backfill Complete.');

    } catch (error) {
        console.error('❌ Fatal error:', error);
    }
}

const args = process.argv.slice(2);
backfillDataIntegrity({ 
    dryRun: args.includes('--dry-run'), 
    limit: args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : undefined 
});
