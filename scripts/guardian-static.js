const fs = require('fs');
const path = require('path');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

// Configuration
const IGNORE_DIRS = ['node_modules', '.next', 'dist', '.git', '.antigravity'];
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        walkDir(fullPath, callback);
      }
    } else {
      callback(fullPath);
    }
  });
}

function scan() {
  console.log('🛡️  Guardian Static Audit (UAQS v3.0)...');
  
  let issuesFound = 0;
  const rootDir = process.cwd();

  walkDir(rootDir, (filePath) => {
    if (!EXTENSIONS.some(ext => filePath.endsWith(ext))) return;
    if (filePath.includes('scripts/') || filePath.includes('guardian-static.js')) return;

    const content = fs.readFileSync(filePath, 'utf8');
    
    // Naive Check: Look for `sql` template literal usages
    // We look for patterns like `sql` followed by backtick
    const sqlRegex = /sql`([\s\S]*?)`/g;
    let match;

    while ((match = sqlRegex.exec(content)) !== null) {
      const query = match[1];
      const lineNo = content.substring(0, match.index).split('\n').length;
      
      // Check for SELECT without LIMIT
      if (query.toUpperCase().includes('SELECT') && 
          query.toUpperCase().includes('FROM') && 
          !query.toUpperCase().includes('LIMIT') && 
          !query.toUpperCase().includes('COUNT(')) {
            
            console.warn(`${RED}[GUARDIAN VIOLATION] Unbounded Query Detected${RESET}`);
            console.warn(`   File:   ${path.relative(rootDir, filePath)}:${lineNo}`);
            console.warn(`   Issue:  SELECT statement missing LIMIT clause.`);
            console.warn(`   Action: Add LIMIT or pagination immediately.\n`);
            issuesFound++;
      }
    }
  });

  if (issuesFound > 0) {
    console.error(`${RED}❌ Audit Failed: ${issuesFound} unbounded queries detected.${RESET}`);
    process.exit(1);
  } else {
    console.log(`${GREEN}✅ Guardian Audit Passed: No unbounded queries found.${RESET}`);
  }
}

scan();
