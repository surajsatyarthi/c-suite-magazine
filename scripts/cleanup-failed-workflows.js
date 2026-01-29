#!/usr/bin/env node

/**
 * Bulk delete failed GitHub Actions workflow runs
 * Usage: node scripts/cleanup-failed-workflows.js
 * 
 * Requires: GitHub CLI (gh) to be authenticated
 */

const { spawnSync } = require('child_process');

const WORKFLOWS = ['e2e.yml', 'sanity-backup.yml'];
const REPO = 'surajsatyarthi/c-suite-magazine';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function executeCommand(command, args) {
    try {
        const result = spawnSync(command, args, { encoding: 'utf-8', stdio: 'pipe', shell: false });
        if (result.error) return null;
        if (result.status !== 0) return null;
        return result.stdout.trim();
    } catch (error) {
        return null;
    }
}

async function getFailedRuns(workflow) {
    log(`\n📋 Fetching failed runs for ${workflow}...`, 'blue');

    const args = ['run', 'list', '--repo', REPO, '--workflow', workflow, '--status', 'failure', '--limit', '100', '--json', 'databaseId,conclusion,createdAt,displayTitle'];
    const output = executeCommand('gh', args);

    if (!output) {
        log(`Error fetching runs for ${workflow}`, 'red');
        return [];
    }

    try {
        return JSON.parse(output);
    } catch (error) {
        log(`Error parsing JSON for ${workflow}: ${error.message}`, 'red');
        return [];
    }
}

function deleteRun(runId) {
    const args = ['run', 'delete', runId.toString(), '--repo', REPO];
    const result = executeCommand('gh', args);
    return result !== null;
}

async function cleanupWorkflow(workflow) {
    log(`\n${'='.repeat(60)}`, 'blue');
    log(`🧹 Cleaning up: ${workflow}`, 'yellow');
    log('='.repeat(60), 'blue');

    const failedRuns = await getFailedRuns(workflow);

    if (failedRuns.length === 0) {
        log('✅ No failed runs found!', 'green');
        return { workflow, deleted: 0, failed: 0 };
    }

    log(`Found ${failedRuns.length} failed runs`, 'yellow');

    let deletedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < failedRuns.length; i++) {
        const run = failedRuns[i];
        const progress = `[${i + 1}/${failedRuns.length}]`;

        process.stdout.write(`${progress} Deleting run ${run.databaseId}... `);

        const success = deleteRun(run.databaseId);

        if (success) {
            deletedCount++;
            log('✅ Deleted', 'green');
        } else {
            failedCount++;
            log('❌ Failed', 'red');
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    log(`\n📊 Summary for ${workflow}:`, 'blue');
    log(`   ✅ Deleted: ${deletedCount}`, 'green');
    if (failedCount > 0) {
        log(`   ❌ Failed: ${failedCount}`, 'red');
    }

    return { workflow, deleted: deletedCount, failed: failedCount };
}

async function main() {
    log('\n🚀 GitHub Actions Workflow Cleanup Tool', 'blue');
    log('========================================\n', 'blue');

    // Check if gh CLI is available
    const ghVersion = executeCommand('gh', ['--version']);
    if (!ghVersion) {
        log('❌ Error: GitHub CLI (gh) is not installed or not in PATH', 'red');
        log('Install it from: https://cli.github.com/', 'yellow');
        process.exit(1);
    }

    log(`Using GitHub CLI version: ${ghVersion.split('\n')[0]}`, 'blue');

    const results = [];

    for (const workflow of WORKFLOWS) {
        const result = await cleanupWorkflow(workflow);
        results.push(result);
    }

    // Final summary
    log('\n' + '='.repeat(60), 'blue');
    log('🎉 CLEANUP COMPLETE', 'green');
    log('='.repeat(60), 'blue');

    const totalDeleted = results.reduce((sum, r) => sum + r.deleted, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);

    results.forEach(r => {
        log(`\n${r.workflow}:`, 'yellow');
        log(`  Deleted: ${r.deleted}`, 'green');
        if (r.failed > 0) {
            log(`  Failed: ${r.failed}`, 'red');
        }
    });

    log(`\n📊 Overall Total:`, 'blue');
    log(`   ✅ Successfully deleted: ${totalDeleted} workflow runs`, 'green');

    if (totalFailed > 0) {
        log(`   ❌ Failed to delete: ${totalFailed} workflow runs`, 'red');
    }

    log('\n✨ Done!\n', 'green');
}

main().catch(error => {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    process.exit(1);
});
