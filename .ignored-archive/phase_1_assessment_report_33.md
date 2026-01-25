# Ralph Protocol: Phase 1 Assessment (Issue #33)

**Task**: Expansion of Visual Regression Coverage (The Eagle)
**Issue ID**: #33
**Priority**: P2 (Revenue Protection)
**Status**: PLANNING (Gate 1)

## 1. Problem Statement

The current visual regression suite (`tests/e2e/visual-regression.spec.ts`) covers the Homepage, CXO Interviews, and Search. However, it completely omits the **Executive Salary** section, which is a verified high-traffic "Bread-Winner" for the magazine.

## 2. Threat Model (v2.5)

| Vector                  | Description                                                             | Mitigation                                            |
| :---------------------- | :---------------------------------------------------------------------- | :---------------------------------------------------- |
| **Revenue Erosion**     | CSS regressions on Salary tables causing unreadable data or broken ads. | **Eagle Eye**: Strict pixel-diffing on Salary pages.  |
| **Silent Layout Shift** | Navigation breaking on specific resolutions.                            | **Eagle Eye**: Snapshotting the "Salary Detail" view. |

## 3. Proposed Solution

Extend `visual-regression.spec.ts` to include:

1.  **Salary Index**: `/executive-salaries`
    - Verify Grid Layout.
    - Verify Search Bar presence.
2.  **Salary Detail**: `/executive-salaries/[slug]` (Dynamic)
    - Verify Data Table formatting.
    - Verify Compensation Breakdown chart.

## 4. Acceptance Criteria (AC)

- [ ] `Executive Salary Index` visual test passed.
- [ ] `Executive Salary Detail` visual test passed.
- [ ] No regression on existing Homepage/CXO tests.
- [ ] Proof logs anchored to Git HEAD.

## 5. Permission Request

I request permission to proceed to **Phase 2 (Execution)** to implement these tests.

### Contextual Anchor

- **Git HEAD**: 0f269d9
- **Timestamp**: 2026-01-23T15:20:00Z
