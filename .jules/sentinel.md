## 2024-02-21 - Fix Body Stream Double-Read in Security Middleware
**Vulnerability:** Denial of Service (DoS) in write operations when content validation is enabled.
**Learning:** Next.js `NextRequest.json()` consumes the request body stream. Once consumed, it cannot be read again by route handlers. Validation middleware that reads the body must pass the parsed payload to the handler instead of expecting the handler to read it again.
**Prevention:** When designing middleware that inspects the request body, always return the parsed payload or a cloned request with a fresh stream. Avoid reading the body multiple times.
