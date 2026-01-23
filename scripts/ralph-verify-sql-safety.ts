import fs from 'fs';
import path from 'path';

// CONFIG
const SEARCH_DIRS = ['lib', 'scripts'];
const POSTGRES_IMPORT = '@vercel/postgres';
const SQL_VAR_NAME = 'sql';

interface Violation {
  file: string;
  line: number;
  content: string;
  reason: string;
}

let totalFilesScanned = 0;
let totalSqlUsages = 0;
const violations: Violation[] = [];

function scanDirectory(dir: string) {
  if (!fs.existsSync(dir)) return;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        scanDirectory(fullPath);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js') || entry.name.endsWith('.tsx'))) {
      // Exclude self from scan to avoid false positives on 'sql' string usages
      if (entry.name === 'ralph-verify-sql-safety.ts') continue;
      scanFile(fullPath);
    }
  }
}

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  if (!content.includes(POSTGRES_IMPORT)) {
    return; // Skip files that don't import postgres
  }

  totalFilesScanned++;
  const lines = content.split('\n');
  
  // Naive but effective regex for detecting `sql` usage
  // We want to ensure every `sql` is followed by a backtick `
  // or a generic type <...> then a backtick `
  
  // Valid patterns:
  // sql`SELECT...`
  // sql<Result>`SELECT...`
  // await sql`SELECT...`
  
  // Invalid patterns:
  // sql('SELECT ' + var)
  // sql.query(...)
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // Find validation indices of 'sql'
    const sqlIndices = [...line.matchAll(/\bsql\b/g)].map(m => m.index!);
    
    for (const idx of sqlIndices) {
      // Check context - is it the import line?
      if (line.includes(`import { sql }`) || line.includes(`import { sql,`)) {
        continue;
      }
      
      const sub = line.substring(idx + 3); // text after 'sql'
      
      // Check 1: Tagged Template (Immediate backtick)
      if (sub.trim().startsWith('`')) {
        totalSqlUsages++;
        continue;
      }
      
      // Check 2: Tagged Template with Generic (e.g., sql<Row>`)
      // Regex for <...>`
      if (/^\s*<[^>]+>\s*`/.test(sub)) {
         totalSqlUsages++;
         continue;
      }
      
      // If we are here, it's a suspicious usage
      // Check 3: Is it just a property access/export? e.g. "export { sql }"
      if (line.includes(`export { sql }`)) continue;
      
      // Check 4: Is it inside a comment? (Naive check)
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;

      violations.push({
        file: filePath,
        line: lineNum,
        content: line.trim(),
        reason: 'Detected "sql" usage that is NOT a direct tagged template literal. Potential SQL Injection risk.'
      });
    }
  }
}

function main() {
  console.log('🛡️  Ralph Protocol: SQL Safety Scanner (Iron Dome) 🛡️');
  console.log('==================================================');
  
  for (const dir of SEARCH_DIRS) {
    scanDirectory(path.join(process.cwd(), dir));
  }
  
  console.log(`\n📊 Scanned ${totalFilesScanned} relevant files (containing @vercel/postgres)`);
  console.log(`✅ Verified ${totalSqlUsages} safe parameterized SQL queries.`);
  
  if (violations.length > 0) {
    console.error(`\n❌ FOUND ${violations.length} POTENTIAL VIOLATIONS:`);
    violations.forEach(v => {
      console.error(`\n   [${v.file}:${v.line}]`);
      console.error(`   Reason: ${v.reason}`);
      console.error(`   Code:   ${v.content}`);
    });
    console.error('\n💥 FAIL: Non-parameterized SQL queries detected.');
    process.exit(1);
  } else {
    console.log('\n🎉 SUCCESS: All SQL usages are parameterized and safe.');
    process.exit(0);
  }
}

main();
