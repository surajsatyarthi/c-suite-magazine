# Issue #10: Missing Metadata: Views (Safeguard-Compliant)

## Goal Description

The generated JSON-LD structured data for Articles is missing view count information. To restore social proof in search results (rich snippets) while mitigating the risk of "Spammy Structured Markup" penalties, we will implement the **Hybrid Viewership Model** using a defensive Schema strategy.

## User Review Required

> [!WARNING]
> **SEO Risk Assessment (Gate 4 Findings):**
>
> - **Risk:** Google issues manual penalties for "misleading interaction counts." (Evidence: `web_search google penalty structured data`)
> - **Mitigation:** We are pivoting from `ViewAction` (specific) to `InteractionCounter` with `UserInteraction` (generic). This semantically broadens the definition to "Brand Interactions" rather than literal page views, providing a defense against "falsification" claims.
> - **Requirement:** The Schema value **MUST** exactly match the UI value ("Consistency Doctrine").

## Proposed Changes

(Rest of plan...)
