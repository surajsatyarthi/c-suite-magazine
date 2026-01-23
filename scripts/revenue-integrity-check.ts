import { spawnSync } from 'child_process';
import registry from '../docs/REVENUE_REGISTRY.json';

async function checkRevenueIntegrity() {
  console.log('🛡️  Starting Revenue Integrity Audit...');
  let failures = 0;

  for (const item of registry) {
    const url = `http://localhost:3000${item.url}`;
    process.stdout.write(`Checking ${item.label} (${url})... `);

    // Using curl to simulate real browser request to local dev/build server
    const result = spawnSync('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', url]);
    const statusCode = result.stdout.toString().trim();

    if (statusCode === '200') {
      console.log('✅ 200 OK');
    } else {
      console.log(`❌ ${statusCode} FAILED`);
      if (item.priority === 'P0') {
        console.error(`🚨 CRITICAL REVENUE BLOCKER: ${item.label} is unreachable!`);
        failures++;
      }
    }
  }

  if (failures > 0) {
    console.error(`\n❌ Total Critical Failures: ${failures}`);
    process.exit(1);
  } else {
    console.log('\n🌟 Revenue Integrity Verified. No critical anchors are broken.');
    process.exit(0);
  }
}

checkRevenueIntegrity();
