# Data Accuracy and Interpretation Guidelines

## Critical Rule: Never Fabricate Data

**Problem**: On 2026-01-09, I fabricated "Mukesh Ambani" in the Industry Juggernauts list by filling in missing information with assumptions instead of stating only verified facts.

---

## Mandatory Data Interpretation Rules

### 1. Handle Truncated Output
**If output is truncated or partial:**
- ✅ Say: "Output is truncated, getting full data"
- ✅ Retrieve complete data before making statements
- ❌ Never fill in missing parts with assumptions

**Example:**
```
BAD: "I see some names, so the list must include Mukesh Ambani..."
GOOD: "Output shows 65 truncated lines. Let me get the complete output."
```

### 2. State Only Verifiable Facts
**Only state information that is:**
- Directly visible in command output
- Explicitly present in file contents
- Confirmed by database query results

**Example:**
```
BAD: "The 9 juggernauts are..." (when I've only seen 5 names)
GOOD: "The output shows 5 names. Let me verify the complete list."
```

### 3. Label Assumptions Explicitly
**If making any inference or assumption:**
- Must start with: "I'm assuming...", "This suggests...", "It appears..."
- Never present assumptions as facts

**Example:**
```
BAD: "The article is about leadership" (based on URL pattern)
GOOD: "The URL suggests it's in the leadership category, but let me verify in Sanity."
```

### 4. When Uncertain, Ask
**If you don't have complete information:**
- ✅ Ask for clarification
- ✅ Say "I don't have enough data to answer that"
- ❌ Never complete the picture with plausible guesses

**Example:**
```
BAD: "Since there are 9 juggernauts, they're probably..."
GOOD: "I can see partial data. Should I get the complete list first?"
```

### 5. Verify Before Presenting
**Before presenting any list or data to user:**
1. Check if output was complete
2. Verify all items are actually present in the data
3. Cross-reference with source if uncertain

---

## Live Site Protection Checklist

### Before Any Sanity Update
- [ ] Is this data from a complete, non-truncated output?
- [ ] Have I verified every item I'm stating exists?
- [ ] Am I presenting facts or assumptions?
- [ ] If assumptions, have I labeled them as such?

### Before Any Code Deployment
- [ ] Tested locally first?
- [ ] Showed user results for approval?
- [ ] No invented data in configuration?
- [ ] All references verified to exist?

---

## Red Flags - Stop and Verify

**Stop immediately if:**
- Output shows "truncated" or "..." 
- You're "filling in" any information
- You're thinking "this should probably include..."
- You're using words like "must be", "should be", "likely is"

**Then:**
1. Get complete data first
2. Verify against source
3. Only then present findings

---

## Real Examples from This Project

### ❌ WRONG (Step 540)
"The 9 Industry Juggernauts are: Mukesh Ambani, Jensen Huang..."
- Ambani was INVENTED
- Based on assumptions, not data
- Presented as fact

### ✅ CORRECT
"Output is truncated (65 lines). I can see 5 names: Amin H. Nasser, Chamath Palihapitiya, Yi He, Mohamed Alabbar, Murray Auchincloss. Let me get the complete list."

---

## Consequences of Violation

**Business Impact:**
- Wrong data pushed to live production site
- Client information incorrectly displayed
- Revenue loss from wrong article placement
- Brand damage from inaccurate content

**Trust Impact:**
- User must fact-check everything I say
- Slows down workflow
- Creates additional burden

---

## Emergency Protocol

**If you realize you've stated something unverified:**
1. Immediately say "I need to verify that"
2. Get the actual data
3. Correct the statement explicitly
4. Don't make excuses - acknowledge the error

---

**Last Updated**: 2026-01-09 01:08 IST  
**Trigger**: Mukesh Ambani fabrication incident  
**Status**: MANDATORY - Must follow for all data interpretation
