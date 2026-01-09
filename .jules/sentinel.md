# Sentinel's Journal

## 2025-02-14 - Body Consumption Vulnerability
**Vulnerability:** `validateWriteRequest` middleware was consuming the `NextRequest` body stream (via `request.json()`) when performing content validation, but the calling route handlers were attempting to read the body again, leading to failures (DOS or broken functionality).
**Learning:** `NextRequest` (and standard `Request`) bodies can only be read once. Middleware or helper functions that validate the body must return the parsed data or a clone to ensure the downstream handler can access it.
**Prevention:** Always return the parsed payload from validation functions that read the request body, or use `request.clone()` if the original stream must be preserved (though cloning has performance implications). Here, we opted to return the parsed payload.
