#!/usr/bin/env node

/**
 * The "No Rush" Check
 * 
 * Purpose: Force a cognitive pause before committing code.
 * "Slow is smooth, smooth is fast."
 */

const readline = require('readline');

const QUESTIONS = [
  "Did you self-review the code after the '24h Cooling Off' period?",
  "Did you run the tests locally (npm test)?",
  "Did you verify there are no hardcoded secrets?",
  "Did you check for 'Slopsquatting' dependencies in package.json?",
  "Is this change associated with an approved RFC or Issue?",
  "Did you verify 'server-only' imports in sensitive files?",
];

// Select 3 random questions
const selectedQuestions = [];
while (selectedQuestions.length < 3) {
  const q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
  if (!selectedQuestions.includes(q)) selectedQuestions.push(q);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.clear();
console.log('\x1b[33m%s\x1b[0m', '🛑 THE NO RUSH CHECK 🛑');
console.log('\x1b[36m%s\x1b[0m', 'Take a breath. Efficiency is not rushing.');
console.log('---------------------------------------------------');

let currentIndex = 0;

function askQuestion() {
  if (currentIndex >= selectedQuestions.length) {
    console.log('\x1b[32m%s\x1b[0m', '✅ No Rush Check Passed. Proceeding to Automated Gates...');
    rl.close();
    process.exit(0);
    return;
  }

  const q = selectedQuestions[currentIndex];
  rl.question(`\n[${currentIndex + 1}/3] ${q} (y/n): `, (answer) => {
    if (answer.toLowerCase() !== 'y') {
      console.log('\x1b[31m%s\x1b[0m', '\n❌ Commitment Aborted.');
      console.log('Please verify all checks before committing.');
      console.log('Remember: "Slow is smooth, smooth is fast."');
      process.exit(1);
    }
    currentIndex++;
    // Add a small artificial delay to force reading
    setTimeout(askQuestion, 500); 
  });
}

// Start the interrogation
askQuestion();
