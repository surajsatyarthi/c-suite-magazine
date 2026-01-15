## 2025-02-12 - [NextRequest Body Consumption]
**Vulnerability:** API routes were validating request bodies using `request.json()` in a middleware helper, but discarding the result. Since `NextRequest` body streams can only be consumed once, subsequent attempts to read the body in the route handler would fail or return empty data.
**Learning:** Middleware or helper functions that validate request bodies must return the parsed data to the caller. You cannot re-read `request.json()` after it has been consumed.
**Prevention:** Ensure that any validation utility that reads the request body returns the parsed body to the consumer.
