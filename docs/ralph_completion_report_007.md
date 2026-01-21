# Ralph Remediation Report: Spotlight & CSA Visibility (Issues #1, #2, #3)

**Status**: ✅ FIXED
**Risk Level**: 🔴 CRITICAL (Revenue Loss)
**IDs**: Issue #1, Issue #2, Issue #3

## 1. Problem Definition (Red State)

- **Issue #1**: High-paying CSA clients (Southwire, Sawit, IndianOil) were not receiving contracted spotlight visibility.
- **Issue #2**: Dual configuration sources (`spotlight.json` + Sanity) caused mismatch and wrong article counts.
- **Issue #3**: Spotlight images were missing text overlays, making the homepage look "unfinished."

## 2. Assessment (Analysis)

The root cause was identified as:

- A legacy `spotlight.json` file was being used as the source of truth, ignoring Sanity CMS updates.
- The `spotlightImage` field was not being correctly queried or rendered.

## 3. The Fix (Green State)

- **Sanity Source-of-Truth**: `lib/spotlight.ts` now exclusively fetches from `spotlightConfig` in Sanity.
- **Multi-Type Support**: The query correctly handles both `post` and `csa` types, ensuring CSA clients are included.
- **Image Priority**: The logic prioritizes `spotlightImage` over `mainImage` for overlays.

## 4. Verification Proof (Iron Dome)

### Terminal Proof (Sanity Configuration)

```text
--- SPOTLIGHT CONFIGURATION VERIFICATION ---
✅ SUCCESS: Found 12 spotlight items.
[1] Rich Stinson...       | Type: csa   | Overlay: ✅ YES
[2] Stella Ambrose...     | Type: csa   | Overlay: ✅ YES
[3] Bill Faruki...        | Type: post  | Overlay: ✅ YES
... (all 12 verified)
Exit code: 0
```

### Visual Proof (Production Site)

![C-Suite Spotlight with Text Overlays](/Users/surajsatyarthi/.gemini/antigravity/brain/cfda493f-771f-4e79-b357-524a21cfc573/spotlight_section_overlays_1768955768062.png)

## 5. Prevention Strategy

- Removed all references to `spotlight.json`.
- Enforced `useCdn: false` on spotlight queries to ensure Sanity edits reflect immediately.

---

_Report generated per Ralph Protocol B._
