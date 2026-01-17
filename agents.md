# Agents.md - Permanent Learnings

This file tracks permanent patterns, gotchas, and learnings for the Antigravity Directory project.

## Project Context

- **Stack:** Next.js 14 (App Router), TypeScript, PostgreSQL, Drizzle ORM
- **Testing:** Vitest, React Testing Library, Playwright
- **Payments:** PayPal, Razorpay
- **Features:** Resource directory, featured listings, contact enrichment

## Learnings

### Next.js App Router Patterns

**API Routes:**

- Use `NextRequest` and `NextResponse` from `next/server`
- Routes are defined as `route.ts` files in `app/api/` directory
- Export named functions: `GET`, `POST`, `PUT`, `DELETE`

**Example:**

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Process request
  return NextResponse.json({ data }, { status: 200 });
}
```

### Payment Integration

**PayPal:**

- Business logic in `src/lib/payment/paypal.ts`
- Env vars: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE`
- Two-step flow: create order → capture payment

**Razorpay:**

- Business logic in `src/lib/payment/razorpay.ts`
- Env vars: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- Amounts must be in paise (multiply rupees by 100)
- Webhook signature verification required (HMAC SHA-256)

### Testing Best Practices

- Use `vi.mock()` for mocking external APIs
- Reset mocks between tests
- Test files mirror source structure: `tests/api/payments/` for `app/api/payments/`
- Coverage target: 80%+

### Common Gotchas

**Vitest Mock Leakage:**

- Using `vi.mock()` without a factory creates a shared mock object.
- `vi.resetAllMocks()` only clears the state of the mock, not necessarily the `mockRejectedValue` implementation if it was set globally.
- **Solution:** Use `mockReset()` on specific functions or use `mockImplementationOnce` within `it` blocks for total isolation.
- Always mock the database (`@/lib/db`) and schema (`@/drizzle/schema`) for API tests.

**Verifying Multi-step Updates:**

- When an API route updates multiple tables (e.g., `payments` and `resources`), use `expect(db.update).toHaveBeenCalledTimes(N)` to ensure all steps are executed.
- Mock returning objects for `db.update().set().where()` to avoid "Cannot read properties of undefined" errors during tests.

**Webhook Verification:**

- For HMAC verification (Razorpay, Stripe, etc.), use `request.text()` to get the raw body. Verifying against a JSON-serialized version of a parsed body can fail due to whitespace or key-ordering differences.

### **Infrastructure Guardrail**

**Avoid the "Mock Mirage":**

- TDD with mocks can hide missing infrastructure (e.g., a missing DB table).
- **Process:** Before implementing an API route that interacts with a new table, explicitly verify the exports in `src/drizzle/schema.ts`.
- **Validation:** Always follow a TDD pass with a "Schema Tally" to ensure all logic-level assumptions are matched by physical database definitions.

---

**Last Updated:** January 14, 2026
