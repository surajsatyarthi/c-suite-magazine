import fs from 'fs';
import path from 'path';

/**
 * 🛡️ Ralph Protocol: Security Scanner (Iron Dome) v3.0
 * 
 * Mandated by Gate 2: Development.
 * Detects SQL Injection (@vercel/postgres) and GROQ Injection (Sanity).
 */

// CONFIG
const SEARCH_DIRS = ['lib', 'scripts', 'app'];
const POSTGRES_IMPORT = '@vercel/postgres';
const SANITY_IMPORTS = ['@sanity/client', 'next-sanity'];

interface Violation {
  file: string;
  line: number;
  content: string;
  reason: string;
  isOverride: boolean;
}

let totalFilesScanned = 0;
let totalSafeQueries = 0;
let totalOverrides = 0;
const violations: Violation[] = [];

function scanDirectory(dir: string) {
  if (!fs.existsSync(dir)) return;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== '.next') {
        scanDirectory(fullPath);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js') || entry.name.endsWith('.tsx'))) {
      if (entry.name === 'ralph-verify-sql-safety.ts') continue;
      scanFile(fullPath);
    }
  }
}

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const hasPostgres = content.includes(POSTGRES_IMPORT);
  const hasSanity = SANITY_IMPORTS.some(imp => content.includes(imp));
  
  if (!hasPostgres && !hasSanity) return;

  totalFilesScanned++;
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    const trimmedLine = line.trim();

    // Check for explicit override comment: RALPH-IGNORE-INJECTION [Reason]
    const hasOverride = line.includes('RALPH-IGNORE-INJECTION');

    // ---------------------------------------------------------
    // 1. SQL INJECTION CHECK (@vercel/postgres)
    // ---------------------------------------------------------
    if (hasPostgres && /\bsql\b/.test(line)) {
      if (!line.includes('import') && !line.includes('export') && !trimmedLine.startsWith('//') && !trimmedLine.startsWith('*')) {
        const sqlIndices = [...line.matchAll(/\bsql\b/g)].map(m => m.index!);
        for (const idx of sqlIndices) {
          const sub = line.substring(idx + 3);
          if (sub.trim().startsWith('`') || /^\s*<[^>]+>\s*`/.test(sub)) {
            totalSafeQueries++;
          } else {
            violations.push({
              file: filePath,
              line: lineNum,
              content: trimmedLine,
              reason: 'SQL: Detected "sql" usage that is NOT a direct tagged template literal.',
              isOverride: hasOverride
            });
          }
        }
      }
    }

    // ---------------------------------------------------------
    // 2. GROQ INJECTION CHECK (Sanity)
    // ---------------------------------------------------------
    if (hasSanity) {
      if (/\.fetch\(\s*`[^`]*\$\{/.test(line)) {
        violations.push({
          file: filePath,
          line: lineNum,
          content: trimmedLine,
          reason: 'GROQ: Detected unsafe string interpolation inside the query string of a .fetch() call.',
          isOverride: hasOverride
        });
      }

      if (/\bgroq\b\s*`[^`]*\$\{/.test(line)) {
        violations.push({
          file: filePath,
          line: lineNum,
          content: trimmedLine,
          reason: 'GROQ: Detected unsafe string interpolation inside groq template tag.',
          isOverride: hasOverride
        });
      }

      if ((/\.fetch\(\s*(`|\$|[a-zA-Z])/.test(line) || /\bgroq\b\s*`/.test(line)) && !line.includes('${')) {
        totalSafeQueries++;
      }
    }
  }
}

function main() {
  console.log('🛡️  Ralph Protocol: Security Scanner (Iron Dome) v3.0 🛡️');
  console.log('======================================================');
  
  for (const dir of SEARCH_DIRS) {
    scanDirectory(path.join(process.cwd(), dir));
  }
  
  const fatalViolations = violations.filter(v => !v.isOverride);
  const overrides = violations.filter(v => v.isOverride);
  
  console.log(`\n📊 Scanned ${totalFilesScanned} high-risk files.`);
  console.log(`✅ Verified ${totalSafeQueries} safe parameterized queries.`);
  
  if (overrides.length > 0) {
    console.warn(`\n⚠️  DETECTED ${overrides.length} AUTHENTICATED OVERRIDES:`);
    overrides.forEach(v => {
      console.warn(`   [${v.file}:${v.line}] OVERRIDDEN: ${v.content}`);
    });
  }

  if (fatalViolations.length > 0) {
    console.error(`\n❌ FOUND ${fatalViolations.length} UNPROTECTED SECURITY VIOLATIONS:`);
    fatalViolations.forEach(v => {
      console.error(`\n   [${v.file}:${v.line}]`);
      console.error(`   Reason: ${v.reason}`);
      console.error(`   Code:   ${v.content}`);
    });
    console.error('\n💥 FAIL: Injection risks detected. Fix by using parameters ($var) or document override with RALPH-IGNORE-INJECTION [Reason].');
    process.exit(1);
  } else {
    if (overrides.length > 0) {
      console.log('\n✅ SUCCESS (with Overrides): No unprotected risks detected.');
    } else {
      console.log('\n🎉 SUCCESS: All queries are parameterized and safe.');
    }
    process.exit(0);
  }
}

main();
