# AI Agent Marketplace — Gateway/Proxy Model

## What this project is
A platform where a **Creator** lists an AI agent they've already built elsewhere (n8n, Make, custom code — any tool; this platform is tool-agnostic) and **sells access to it**, either as a one-time purchase or a monthly subscription (Creator's choice per listing). The Creator hosts/runs the agent themselves and exposes it via a webhook/API endpoint.

This platform does **not** build, host, or run any agent logic. It is purely:
- a listings marketplace
- a payments layer (Stripe, one-time + subscription)
- a secure reverse-proxy **gateway** that mediates access so buyers never see the Creator's raw endpoint URL or secret
- a lightweight Creator↔Client support-messaging feature (human support/ideas, not AI-automated)

One account can be both Creator and Client — roles are derived from relations (having a `Listing` makes you a Creator; having an `Access` makes you a Client), not a stored role flag.

## Why this is simpler than an "agent builder" platform
No LLM orchestration happens here: no vector DB, no embeddings, no document parsing, no LLM API key. It's a CRUD app (listings, payments, dashboards) plus one genuinely novel/risky piece: the invoke gateway.

## Tech Stack
- **Next.js 14+ (App Router) + TypeScript**
- **PostgreSQL + Prisma**
- **Auth.js (NextAuth v5)** — credentials/OAuth, DB sessions
- **Stripe** — Checkout (`mode: payment`) for one-time, Stripe Subscriptions for recurring, both via **Stripe Connect** (destination charges / `application_fee_percent`) for Creator payouts
- **Secret encryption**: AES-256-GCM (Node `crypto`), server-only `ENCRYPTION_KEY` env var — decrypt only in-memory at call time, never logged
- **Rate limiting**: Upstash Redis (`@upstash/ratelimit`)
- Native `fetch` + `AbortController` for the gateway's outbound calls (timeouts)
- Tailwind CSS + Zod, deployed on Vercel
- **Explicitly not used**: any LLM/embeddings API key, vector DB, document-parsing libraries

## Data Model (`prisma/schema.prisma`)
- **User** — no stored role enum. `stripeCustomerId` (buyer side), `stripeConnectAccountId`/`stripeConnectOnboarded` (seller side), both lazily populated.
- **Listing** — Creator-owned: `title`, `description`, `category` enum (CustomerSupport/Sales/AppointmentBooking/HR/Education/RealEstate/Healthcare/Custom), `endpointUrl`, `authType` (None/ApiKey/Bearer/Basic), encrypted secret fields (`authSecretCiphertext`/`iv`/`authTag`), `requestNotes` (free text), `pricingType` (ONE_TIME/SUBSCRIPTION), `priceCents`, `billingPeriod`, `stripeProductId`/`stripePriceId`, `status` (Draft/Published/Archived).
- **Access** — unified entitlement model (single model, not separate Purchase/Subscription tables — keeps the gateway's hot-path check a single query): `type` (ONE_TIME/SUBSCRIPTION), `status` (Pending/Active/Canceled/Expired/PastDue), Stripe IDs, `currentPeriodEnd` (subscription only). `isActive(access)`: one-time → `status===ACTIVE`; subscription → `status===ACTIVE && currentPeriodEnd > now`. `@@unique([listingId, buyerId])`.
- **ApiKey** — scoped key per Access; shown once at creation, hash stored, never retrievable raw again. The buyer's primary integration credential.
- **InvocationLog** — per-call record: status, latency, `outcome` enum (Success/CreatorError/CreatorTimeout/CreatorUnreachable/AccessDenied/RateLimited). Does **not** log full request/response bodies by default.
- **SupportThread**/**SupportMessage** — tied to a specific `Access` (one thread per purchase/subscription), Creator↔Client messages.

## The Gateway — `app/api/invoke/[listingId]/route.ts`
The highest-risk, most novel file in the system. Flow:
1. Authenticate caller via their `ApiKey` (or session, for the Creator's own test calls).
2. Resolve `Access`, confirm it belongs to this `listingId`.
3. `isActive(access)` check — if false, `403` immediately, log `ACCESS_DENIED`, **no call to the Creator's endpoint**.
4. Rate-limit per buyer (Upstash) — exceed → `429`.
5. Decrypt the Listing's auth secret in-memory (never logged).
6. Forward the buyer's request body to `endpointUrl`, injecting the Creator's credential as the correct header per `authType`; strip the buyer's own API key before forwarding.
7. Call with a timeout (`AbortController`, ~15-20s). **No automatic retries** on non-idempotent calls — could double-trigger side effects (e.g. duplicate booking) in the Creator's workflow.
8. Map outcomes clearly: success → pass through; Creator 4xx/5xx → wrapped upstream error; timeout → `504`; unreachable → `502`. The raw `endpointUrl`/secret must never appear in any response to the buyer.
9. Write an `InvocationLog` row.

A near-identical `app/api/listings/[listingId]/test-invoke/route.ts` lets a Creator test their own endpoint pre-publish (session-auth as owner, no `Access` required).

## Payments
- **One-time**: Stripe Checkout `mode: payment`, `application_fee_amount` + `transfer_data.destination`.
- **Subscription**: recurring `Price` cached on the Listing at first publish; Checkout `mode: subscription` with `application_fee_percent`.
- **Single webhook handler** (`app/api/webhooks/stripe/route.ts`): `checkout.session.completed` → create/activate `Access` + issue `ApiKey` + create `SupportThread`; `invoice.payment_succeeded` → extend `currentPeriodEnd`; `invoice.payment_failed`/`past_due` → `Access.status = PAST_DUE` (treated as inactive immediately, v1 simplicity); `customer.subscription.deleted` → `CANCELED`.

## Optional Chat Widget
`public/widget.js` (embed with `data-listing-id` + a scoped, revocable `data-api-key` — safe client-side since it's not the Creator's real secret) opens an iframe chat UI calling the gateway with `{message}`, displaying a documented `reply` field. Secondary to the primary integration method (raw gateway URL + API key), since many agents aren't chat-shaped.

## Route Map
```
app/listings/page.tsx, [listingId]/page.tsx           # public browse + storefront
app/(dashboard)/creator/{dashboard,listings,support}   # manage listings, sales, support inbox
app/(dashboard)/client/{dashboard,agents,support}      # purchased agents, API key, usage, support
app/api/listings/route.ts, [listingId]/route.ts        # CRUD
app/api/listings/[listingId]/test-invoke/route.ts
app/api/invoke/[listingId]/route.ts                    # the gateway
app/api/checkout/route.ts, webhooks/stripe/route.ts
app/api/access/[accessId]/keys/route.ts                # issue/rotate API keys
app/api/support/threads/[threadId]/messages/route.ts
app/api/connect/onboard/route.ts
lib/crypto.ts                                           # AES-256-GCM encrypt/decrypt
```

## Build Order
1. Scaffold (Next.js+TS+Tailwind+Prisma+Postgres) — boots, migrates clean.
2. Auth (roles-by-relation) — both dashboard views reachable from one account.
3. Listing CRUD (no payment) — secret encrypt/decrypt round-trip verified.
4. One-time purchase + gateway proxy (core loop) — needs a real test endpoint first (webhook.site or a 2-minute n8n Cloud webhook). Verify full purchase → API key → gateway call → response round-trip.
5. Subscription pricing type — renewal/cancellation webhooks, `isActive` period check.
6. Creator-Client messaging — SupportThread auto-created on purchase.
7. Optional widget.
8. Dashboard/analytics polish.

## Local Dev Env Vars
`DATABASE_URL`, `NEXTAUTH_SECRET`/`NEXTAUTH_URL`, `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`/`STRIPE_CONNECT_CLIENT_ID`, `ENCRYPTION_KEY` (base64 32-byte AES key), `UPSTASH_REDIS_REST_URL`/`TOKEN`.

## Critical Files
- `prisma/schema.prisma` — all model decisions, the unified `Access` entitlement design.
- `app/api/invoke/[listingId]/route.ts` — the gateway.
- `lib/crypto.ts` — secret encryption helpers.
- `app/api/webhooks/stripe/route.ts` — unified one-time + subscription billing state.
- `app/(dashboard)/creator/listings/new/page.tsx` + `app/api/listings/route.ts` — listing creation + test-invoke.
