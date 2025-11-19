#!/usr/bin/env node
/*
 * Validate exported post JSON files for required fields before import.
 *
 * Required fields:
 *  - title (string)
 *  - slug (string)
 *  - writerSlug (string)
 *  - categories (array with at least one item; each has slug/title)
 *  - body (array or string; non-empty)
 *
 * Usage:
 *   node scripts/validate-exported-posts.js [exportsDir]
 *
 * Default `exportsDir` is `exports/posts`.
 */

const fs = require('fs');
const path = require('path');

function nonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0
}

function hasBody(json) {
  if (Array.isArray(json.body)) return json.body.length > 0
  if (typeof json.body === 'string') return json.body.trim().length > 0
  return false
}

function hasCategories(json) {
  if (!Array.isArray(json.categories) || json.categories.length === 0) return false
  return json.categories.every(c => c && ((c.slug && (c.slug.current || typeof c.slug === 'string')) || nonEmptyString(c.title)))
}

function validate(json) {
  const errors = []
  if (!nonEmptyString(json.title)) errors.push('title')
  if (!nonEmptyString(json.slug)) errors.push('slug')
  if (!nonEmptyString(json.writerSlug)) errors.push('writerSlug')
  if (!hasCategories(json)) errors.push('categories')
  if (!hasBody(json)) errors.push('body')
  return errors
}

function main() {
  const args = process.argv.slice(2)
  const exportsDir = args[0] ? args[0] : path.join('exports', 'posts')
  const targetDir = path.resolve(process.cwd(), exportsDir)

  if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
    console.error(`Directory not found or not a directory: ${targetDir}`)
    process.exit(1)
  }

  const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.json'))
  let ok = 0
  const failures = []

  for (const file of files) {
    const fullPath = path.join(targetDir, file)
    try {
      const raw = fs.readFileSync(fullPath, 'utf8')
      const json = JSON.parse(raw)
      const errors = validate(json)
      if (errors.length === 0) {
        ok++
      } else {
        failures.push({ file, errors })
      }
    } catch (err) {
      failures.push({ file, errors: ['invalid JSON'] })
    }
  }

  console.log(`Validated: ${files.length}`)
  console.log(`OK: ${ok}`)
  console.log(`Failures: ${failures.length}`)
  if (failures.length) {
    for (const f of failures) {
      console.log(`ERROR ${f.file}: missing ${f.errors.join(', ')}`)
    }
    process.exit(1)
  } else {
    process.exit(0)
  }
}

if (require.main === module) {
  main()
}
