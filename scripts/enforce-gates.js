const fs = require('fs');
const path = require('path');

const targetFileArg = process.argv[2];
let tableFile = targetFileArg;

if (!tableFile) {
    // Auto-discovery mode for Hook
    // 1. Check if 'issues/#current-progress-table.md' exists (User suggestion)
    const defaultPath = path.join('issues', '#current-progress-table.md');
    if (fs.existsSync(defaultPath)) {
        tableFile = defaultPath;
    } else {
        // 2. Fallback: Find the most recently modified progress table
        const issuesDir = 'issues';
        if (fs.existsSync(issuesDir)) {
            const files = fs.readdirSync(issuesDir)
                .filter(f => f.match(/progress-table\.md$/))
                .map(f => ({ name: f, time: fs.statSync(path.join(issuesDir, f)).mtime.getTime() }))
                .sort((a, b) => b.time - a.time);
            
            if (files.length > 0) {
                tableFile = path.join(issuesDir, files[0].name);
                console.log(`ℹ️ Auto-detected active progress table: ${tableFile}`);
            }
        }
    }
}

if (!tableFile || !fs.existsSync(tableFile)) {
    console.log('ℹ️ No active progress table found (checked issues/#current-progress-table.md and recent modifications). Skipping Gate Enforcer.');
    process.exit(0); 
}

console.log(`🔒 Verifying Gates in: ${tableFile}`);
const content = fs.readFileSync(tableFile, 'utf-8');
const rows = content.split('\n');

let currentGate = 0;
let headerFound = false;

for (const row of rows) {
    const trimmed = row.trim();
    if (!trimmed) continue;
    
    // Detect Header to start counting
    if (trimmed.startsWith('|') && trimmed.toLowerCase().includes('gate') && trimmed.toLowerCase().includes('status')) {
        headerFound = true;
        continue;
    }
    if (trimmed.startsWith('|---')) continue;
    if (!headerFound) continue;

    const cells = trimmed.split('|').map(c => c.trim()).filter(c => c !== '');
    if (cells.length < 3) continue; 

    // Skip header separator row if regex missed it or logic flaw
    if (cells[0].includes('---')) continue;

    const status = cells[1];
    const proof = cells[2];
    
    // Increment gate counter for every valid data row
    currentGate++; 
    
    const isDone = status.toLowerCase().includes('done') || status.includes('✅');
    const isPending = status.includes('⏳') || status.toLowerCase().includes('pending');

    if (isPending) {
        if (currentGate < 10) {
             console.error(`❌ Gate ${currentGate} is Pending. You cannot commit/proceed until this gate is ✅ Done with PROOF.`);
             console.error(`   (Rule: Complete the work, capture the proof, update the table, THEN commit.)`);
             process.exit(1);
        }
    } else if (isDone) {
        if (!proof || proof.length < 5 || proof.includes('Proof (Terminal')) {
             console.error(`❌ Gate ${currentGate} is marked Done but lacks concrete proof.`);
             process.exit(1);
        }
    }
}

console.log('✅ Enforcer Table verified. All completed gates have proof.');
process.exit(0);
