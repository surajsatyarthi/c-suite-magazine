## 2024-05-22 - Limit SQL Queries
**Learning:** The default behavior of `getAllExecutivesWithCompensation` was to fetch 10,000 records, even when only the top 3 were needed. This caused unnecessary database load and memory usage in Node.js.
**Action:** Always check if a data fetching function supports a `limit` parameter and use it when only a subset of data is required. If it doesn't support it, implement it.
