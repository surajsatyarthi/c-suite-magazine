## 2024-05-22 - Database Over-fetching
**Learning:** The `getAllExecutivesWithCompensation` function was fetching the entire dataset (potentially thousands of rows) to display only 3 records on the homepage. This "fetch all then slice in JS" pattern destroys scalability.
**Action:** Always check if data-fetching functions support `LIMIT` when used in high-traffic paths. If not, refactor them to push the limit to the database query (e.g., `LIMIT ${limit ?? null}`).
