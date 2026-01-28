/**
 * RALPH PROTOCOL: ASSUMPTION SCANNER
 * Enforces the Integrity Layer by blocking fragile patterns in staged code.
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const BYPASS_KEYWORD = "RALPH-BYPASS";

const PATTERNS = [
  {
    name: 'Unprotected "any"', // RALPH-BYPASS Self-reference
    regex: /\bany\b/g,
    extensions: [".ts", ".tsx"],
    message:
      'Detected "any" type. Use a specific type or bypass with // RALPH-BYPASS [justification].',
  },
  {
    name: "Shell Failure Masking (|| true)", // RALPH-BYPASS Self-reference
    regex: /\|\|\s*true\b/g,
    extensions: [".sh", ".ts", ".js"],
    message:
      'Detected "|| true". Ensure failures are handled correctly or use RALPH-BYPASS.',
  },
  {
    name: "Hardcoded Category URL",
    regex: /\/category\/[a-zA-Z0-9-]+/g,
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    message:
      "Detected hardcoded /category/ URL. Use unified routing in lib/urls.ts.",
  },
  {
    name: "Incomplete GROQ query (Missing _type)",
    regex: /\*\[_type\s*==\s*['"][^'"]+['"](?![^]*_type)/g, // Simple heuristic for missing _type in projection
    extensions: [".ts", ".tsx"],
    message:
      "Detected GROQ query likely missing _type in projection. Explicit _type is required for the Integrity Layer.",
  },
];

async function scan() {
  console.log("🛡️  RALPH INTEGRITY: Starting Assumption Scan...");

  let stagedFiles: string[] = [];
  try {
    // eslint-disable-next-line sonarjs/os-command, sonarjs/no-os-command-from-path
    stagedFiles = execSync("git diff --cached --name-only --diff-filter=d")
      .toString()
      .split("\n")
      .filter((f) => f.trim().length > 0);
  } catch (e) {
    console.error("❌ Failed to get staged files.");
    process.exit(1);
  }

  let hasErrors = false;

  for (const file of stagedFiles) {
    const ext = path.extname(file);
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if (!fs.existsSync(file)) continue; // Skip deleted files
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split("\n");

    for (const pattern of PATTERNS) {
      if (pattern.extensions.includes(ext)) {
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (pattern.regex.test(line)) {
            // Check for bypass
            if (!line.includes(BYPASS_KEYWORD)) {
              console.error(`❌ ${pattern.name} in ${file}:${i + 1}`);
              console.error(`   > ${line.trim()}`);
              console.error(`   💡 ${pattern.message}`);
              hasErrors = true;
            }
          }
          // Reset regex state for global matches
          pattern.regex.lastIndex = 0;
        }
      }
    }
  }

  if (hasErrors) {
    console.error(
      "\n🚫 SCAN FAILED: Structural integrity violations detected.",
    );
    process.exit(1);
  } else {
    console.log("✅ SCAN PASSED: No fragile patterns detected.");
    process.exit(0);
  }
}

scan();
