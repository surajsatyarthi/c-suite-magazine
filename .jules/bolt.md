## 2025-01-28 - Buffer Polyfill Optimization
**Learning:** Client-side components using `Buffer` force Webpack to include the `buffer` polyfill (approx. 4-5KB gzipped). Replacing it with `btoa` for simple base64 encoding (e.g. SVGs) completely avoids this.
**Action:** Always prefer `btoa` (browser-native) over `Buffer` (Node-native) for base64 encoding in shared/client components.
