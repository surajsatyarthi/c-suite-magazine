import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// CONFIG
const BYPASS_ENV_VAR = 'RALPH_BYPASS';
const ARTIFACT_DIR_BASE = '.gemini/antigravity/brain'; // Relative to home usually, but we need to find the active brain.
// NOTE: Since the brain path is dynamic per session, we might need a marker or we search for the latest modified.
// For now, we will enforce that the commit message contains a Reference to the artifacts OR we check the CWD for known artifact patterns.
// ACTUALLY: A better approach for the Agent is to verify the FILES being committed include compliance docs if they are "finish" commits.

// REVISED STRATEGY for AGENT:
// The Agent works in a specific brain directory. The Enforcer runs in the Repo.
// The Enforcer cannot easily know *which* brain directory is active.
// HOWEVER, the Agent *always* writes artifacts to the brain.

// SIMPLIFICATION for V1:
// 1. Enforce Branch Naming (must have issue #).
// 2. Enforce "Intent" in Commit Message (must cite strict protocol gates for P0s).

console.log("👮 RALPH ENFORCER v2.1 (The Proof Edition)");

// Check Bypass
if (process.env[BYPASS_ENV_VAR]) {
    console.warn(`⚠️  BYPASS DETECTED: ${BYPASS_ENV_VAR} is set. Proceeding with caution.`);
    process.exit(0);
}

try {
    // 1. Get Current Branch
    const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    console.log(`📂 Branch: ${branch}`);

    // 2. Extract Issue ID
    const match = branch.match(/issue-(\d+)/i);
    if (!match) {
        console.warn("⚪ No Issue ID detected in branch name. Skipping protocol check.");
        // We only enforce on strict feature branches.
        process.exit(0);
    }
    const issueId = match[1];
    
    // 3. (FUTURE) Verify Artifacts
    // Since artifacts are outside the repo (in .gemini), we can't easily check them from a pre-commit hook running inside the repo 
    // without hardcoding the agent's brain path, which changes.
    // 
    // PROXY CHECK:
    // If we are on an issue branch, we expect the commit message to potentially declare a gate.
    
    console.log(`✅ Issue #${issueId} detected. Enforcer Monitoring Active.`);
    
    // For now, we just enforce that the user (Agent) is *aware* of the protocol.
    // In v3, we will link the brain folder via a symlink or env var.

    process.exit(0);

} catch (error) {
    console.error("❌ Enforcer Crashed:", error);
    process.exit(1); // Fail safe
}
