#!/bin/bash
# Canonical Enforcer Script v1.1
# Scans for references to deprecated documents and fails if found.

# List of forbidden terms (add more as needed)
FORBIDDEN_TERMS="RALPH_OMNIBUS|MANDATORY_PROTOCOLS|RALPH_PROTOCOL|world_class_engineering_standards|operational|protocols"

# Files to scan (expandable)
FILES_TO_SCAN=$(git diff --cached --name-only | grep -E '\.md$|\.ts$|\.tsx$|\.js$')  # Targets Markdown and code files

if [ -z "$FILES_TO_SCAN" ]; then
  echo "No relevant files changed. Skipping check."
  exit 0
fi

FOUND_VIOLATIONS=0

for FILE in $FILES_TO_SCAN; do

  # Check for Forbidden Terms
  if grep -inE "$FORBIDDEN_TERMS" "$FILE"; then
    echo "❌ Forbidden reference found in $FILE:"
    grep -inE "$FORBIDDEN_TERMS" "$FILE"
    FOUND_VIOLATIONS=1
  fi

  # Gate 4 Skip Detection (Executive Solution)
  # Check relevant planning documents for research keywords
  if [[ "$FILE" == *"implementation_plan.md"* ]] || [[ "$FILE" == *"task.md"* ]] || [[ "$FILE" == *"gate4"* ]]; then
    REQUIRED_TERMS="web_search|online research"
    if ! grep -iqE "$REQUIRED_TERMS" "$FILE"; then
      echo "❌ Gate 4 skip detected in $FILE - Online search evidence missing"
      echo "   Rule: You MUST use 'web_search' or perform 'online research' before planning."
      FOUND_VIOLATIONS=1
    fi
  fi
done

if [ $FOUND_VIOLATIONS -eq 1 ]; then
  echo "Error: Deprecated document references detected. Use only SUPREME_RALPH_CONSTITUTION.md."
  exit 1
fi

echo "✅ All clear: No deprecated references."
exit 0
