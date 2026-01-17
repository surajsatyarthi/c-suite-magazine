const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = [
  'lib/db.ts',
  'lib/sanityWrite.ts',
  'lib/notify.ts',
  'lib/jules-client.ts',
  'lib/guardian.ts'
];

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

let hasError = false;

console.log('🔒 Starting Server-Side Leaks Audit...\n');

REQUIRED_FILES.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes("import 'server-only'") || content.includes('import "server-only"')) {
      console.log(`${GREEN}✓ ${file}${RESET}`);
    } else {
      console.log(`${RED}✗ ${file} is MISSING "import 'server-only'"${RESET}`);
      hasError = true;
    }
  } catch (err) {
    console.log(`${RED}✗ ${file} could not be read: ${err.message}${RESET}`);
    hasError = true;
  }
});

if (hasError) {
  console.log(`\n${RED}Audit FAILED: Some sensitive files are unprotected.${RESET}`);
  process.exit(1);
} else {
  console.log(`\n${GREEN}Audit PASSED: All sensitive files are protected.${RESET}`);
  process.exit(0);
}
