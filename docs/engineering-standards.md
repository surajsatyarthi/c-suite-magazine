# C-Suite Magazine: Engineering Standards & Preventative Checks

## 1. Database & Performance Protocol

**Problem**: "Fetching entire database" (Unbound Queries) causing slow load times and OOM risks.
**Prevention**:

### A. Mandatory Pagination / Limits

- **Rule**: NO database query (`SELECT *`) is allowed without a `LIMIT` clause.
- **Implementation**:
  - API Functions must accept `limit` and `offset` (or `cursor`) parameters.
  - Default `limit` must be safe (e.g., 50 or 100), NEVER "Infinity".
  - **Bad**: `getAllExecutives()`
  - **Good**: `getExecutives({ limit = 100, offset = 0 })`

### B. "Explain Plan" Review

- **Rule**: For any new query, run `EXPLAIN ANALYZE` if the expected row count > 1000.
- **Check**: Does the query perform a "Seq Scan" (Full Table Scan) on a large table? If yes, add an Index.

### C. Data Volume Testing

- **Rule**: Dev environments must simulate production volume.
- **Action**: Use seed scripts to generate 10,000+ dummy records during testing to expose performance flaws immediately, rather than waiting for production.

## 2. CI/CD Checks

- **Linting**: Enable `sql-lint` or similar to detect `SELECT` without `LIMIT`.
- **Timeout Thresholds**: Set strict timeouts (e.g., 2000ms) on API routes. If a route times out fetching data, it fails the build/test.

## 3. Review Checklist (The "Pull Request" Gate)

Before approving any PR, the reviewer (and AI) must verify:

- [ ] **DB**: Does every SQL query have a `LIMIT`?
- [ ] **DB**: Are indexes present for `WHERE` and `ORDER BY` columns?
- [ ] **Perf**: Is the "Time Complexity" linear or worse? (Avoid O(n) on DB rows).
- [ ] **Safety**: Are there fallback/timeout mechanisms?
