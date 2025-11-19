#!/usr/bin/env node
/*
 * Backfill missing categories in exported post JSON files.
 *
 * - Adds a `categories` array when missing or empty
 * - Each category entry includes `{ title, slug: { current } }`
 * - Does NOT modify files that already have categories
 *
 * Usage:
 *   node scripts/backfill-categories-in-exports.js [exportsDir] [--categories=leadership,innovation]
 *
 * Defaults:
 *   exportsDir: `exports/posts`
 *   categories: `leadership`
 */

const fs = require('fs')
const path = require('path')

function toTitle(slug) {
  return String(slug || '')
    .split('-')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')
}

function getArg(name) {
  const arg = (process.argv || []).find((a) => a.startsWith(`--${name}=`))
  return arg ? arg.slice(name.length + 3) : undefined
}

function parseCategoriesArg() {
  const raw = getArg('categories') || 'leadership'
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

function buildCategories(slugs) {
  return slugs.map((slug) => ({ title: toTitle(slug), slug: { current: slug } }))
}

function main() {
  const args = process.argv.slice(2)
  const exportsDir = args[0] ? args[0] : path.join('exports', 'posts')
  const targetDir = path.resolve(process.cwd(), exportsDir)
  const slugs = parseCategoriesArg()

  if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
    console.error(`Directory not found or not a directory: ${targetDir}`)
    process.exit(1)
  }

  const files = fs.readdirSync(targetDir).filter((f) => f.endsWith('.json'))
  let updated = 0
  const changed = []
  const failures = []

  for (const file of files) {
    const full = path.join(targetDir, file)
    try {
      const raw = fs.readFileSync(full, 'utf8')
      const json = JSON.parse(raw)
      if (Array.isArray(json.categories) && json.categories.length > 0) {
        continue
      }
      json.categories = buildCategories(slugs)
      fs.writeFileSync(full, JSON.stringify(json, null, 2))
      updated++
      changed.push(file)
    } catch (e) {
      console.error(`ERROR ${file}:`, e?.message || e)
      failures.push(file)
    }
  }

  console.log(`Backfill complete: updated ${updated} file(s).`)
  if (changed.length) {
    console.log('Files updated:')
    for (const f of changed) console.log(`- ${f}`)
  }
  if (failures.length) {
    console.log('Failures encountered:')
    for (const f of failures) console.log(`- ${f}`)
    process.exit(1)
  } else {
    process.exit(0)
  }
}

if (require.main === module) {
  main()
}
