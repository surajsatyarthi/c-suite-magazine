# Sentinel Journal

## 2025-10-24 - Critical Functional & Security Fix in Request Validation
**Vulnerability:** API endpoints using `validateWriteRequest` with `validateContent: true` were completely broken because the request body stream was consumed during validation and not available for the actual handler. This is a Denial of Service (DoS) of the write functionality.
**Learning:** `NextRequest.json()` consumes the request body stream, which can only be read once. Cloning the request with the parsed body (as attempted) is tricky and in this case was not even returned/used by the caller.
**Prevention:** Validation utilities that parse the request body must return the parsed payload to the caller to avoid re-reading the stream.
