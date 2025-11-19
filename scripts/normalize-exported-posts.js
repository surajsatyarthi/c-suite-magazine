#!/usr/bin/env node
/*
 * Normalize exported post JSON files to ensure a top-level `writerSlug` exists.
 *
 * Usage:
 *   node scripts/normalize-exported-posts.js [exportsDir] [--remove-authorSlug]
 *
 * Default `exportsDir` is `exports/posts`.
 *
 * Strategy to resolve `writerSlug` (priority order):
 *   1) json.writerSlug
 *   2) json.writer?.slug?.current
 *   3) json.authorSlug
 *   4) json.author?.slug?.current
 *   5) slugify(json.writer?.name || json.author?.name || json.byline)
 */

const fs = require('fs');
const path = require('path');

function slugify(input) {
  if (!input || typeof input !== 'string') return '';
  return input
    .trim()
    .toLowerCase()
    .replace(/['”“‘’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-');
}

function resolveWriterSlug(json) {
  if (json.writerSlug && typeof json.writerSlug === 'string' && json.writerSlug.length > 0) {
    return json.writerSlug;
  }
  const fromWriter = json?.writer?.slug?.current;
  if (fromWriter && typeof fromWriter === 'string') return fromWriter;

  const fromAuthorSlug = json.authorSlug;
  if (fromAuthorSlug && typeof fromAuthorSlug === 'string') return fromAuthorSlug;

  const fromAuthor = json?.author?.slug?.current;
  if (fromAuthor && typeof fromAuthor === 'string') return fromAuthor;

  const nameCandidate = json?.writer?.name || json?.author?.name || json?.byline;
  const slugFromName = slugify(nameCandidate);
  if (slugFromName) return slugFromName;

  return '';
}

function main() {
  const args = process.argv.slice(2);
  const exportsDir = args[0] ? args[0] : path.join('exports', 'posts');
  const removeAuthorSlug = args.includes('--remove-authorSlug');

  const targetDir = path.resolve(process.cwd(), exportsDir);
  if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
    console.error(`Directory not found or not a directory: ${targetDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.json'));
  let updated = 0;
  let already = 0;
  let unresolved = 0;

  for (const file of files) {
    const fullPath = path.join(targetDir, file);
    try {
      const raw = fs.readFileSync(fullPath, 'utf8');
      const json = JSON.parse(raw);

      const existing = json.writerSlug && typeof json.writerSlug === 'string' && json.writerSlug.length > 0;
      const slug = resolveWriterSlug(json);

      if (existing) {
        already++;
      } else if (slug) {
        json.writerSlug = slug;
        if (removeAuthorSlug && 'authorSlug' in json) {
          delete json.authorSlug;
        }
        fs.writeFileSync(fullPath, JSON.stringify(json, null, 2) + '\n', 'utf8');
        updated++;
      } else {
        unresolved++;
      }
    } catch (err) {
      console.error(`Failed to process ${fullPath}:`, err.message);
    }
  }

  console.log(`Processed: ${files.length}`);
  console.log(`Updated writerSlug: ${updated}`);
  console.log(`Already had writerSlug: ${already}`);
  console.log(`Unresolved (no writer info): ${unresolved}`);
}

if (require.main === module) {
  main();
}

